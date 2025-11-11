#!/usr/bin/env python3
"""
Utility script to seed Wizer Properties with building projects and their units.

The script reads the research JSON files that live under `docs/postman/`
(`pojects.json` for buildings and `units.json` for units), then calls the
existing REST endpoints to create each building followed by its associated
units.  It is designed for local development usage where the API is normally
available at http://0.0.0.0:8000/.

Example usage (basic authentication):

    python scripts/submit_projects_units.py \\
        --username satnam182@gmail.com \\
        --password 'your-password' \\
        --base-url http://0.0.0.0:8000/

By default the script uses HTTP Basic Auth because that is how the bundled
Postman collection authenticates.  If the deployment exposes a token based
flow, pass `--token '...jwt...'` along with `--auth-mode token`.
"""

from __future__ import annotations

import argparse
import json
import mimetypes
import random
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Tuple

import requests
from requests import Response, Session
from requests.auth import HTTPBasicAuth


REPO_ROOT = Path(__file__).resolve().parents[1]
PROJECTS_PATH = REPO_ROOT / "docs" / "postman" / "pojects.json"
UNITS_PATH = REPO_ROOT / "docs" / "postman" / "units.json"

# Local media placeholders – replace these with project specific assets as needed.
DEFAULT_BUILDING_IMAGE = REPO_ROOT / "docs" / "Documents" / "1.png"
DEFAULT_BUILDING_FLOOR_PLAN = REPO_ROOT / "docs" / "Documents" / "Screenshot 2025-02-05 at 18.39.59.png"
DEFAULT_BUILDING_MASTER_PLAN = REPO_ROOT / "docs" / "Documents" / "Screenshot 2025-02-06 at 15.40.42.png"
DEFAULT_BUILDING_VIDEO = REPO_ROOT / "src" / "wizerproperties" / "static" / "media" / "demo_img" / "3D_House.mp4"
DEFAULT_PROPERTY_IMAGE = REPO_ROOT / "docs" / "Documents" / "2.png"
DEFAULT_PROPERTY_VIDEO = DEFAULT_BUILDING_VIDEO
MEDIA_PHOTO_DIR = REPO_ROOT / "docs" / "media" / "photo"
MEDIA_VIDEO_DIR = REPO_ROOT / "docs" / "media" / "video"

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".tiff", ".heif", ".heic", ".svg"}
VIDEO_EXTENSIONS = {".mp4", ".mov", ".avi", ".wmv", ".mkv", ".flv"}

# Map researched sub-type labels to the choices expected by the API.
RESIDENCE_SUB_TYPE_MAP = {
    "condo": "apartment_condo_service_residence",
    "apartment": "apartment_condo_service_residence",
    "apartment/condo/service residence": "apartment_condo_service_residence",
    "service residence": "apartment_condo_service_residence",
    "villa": "bungalow_villa",
    "bungalow": "bungalow_villa",
    "semi-detached": "semi_detached_house",
    "terrace": "terrace_link_house",
    "link house": "terrace_link_house",
    "residential land": "residential_land",
}


class ScriptError(RuntimeError):
    """Raised when the script cannot continue safely."""


def load_json(path: Path) -> List[Dict]:
    if not path.exists():
        raise ScriptError(f"Required data file missing: {path}")
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def slugify(value: str) -> str:
    keep = []
    for char in value.lower():
        if char.isalnum():
            keep.append(char)
        elif char in {" ", "-", "_"}:
            keep.append("-")
    slug = "".join(keep).strip("-")
    while "--" in slug:
        slug = slug.replace("--", "-")
    return slug


def detect_bool(keywords: Iterable[str], facilities: Iterable[str]) -> bool:
    facilities_text = " ".join(facilities).lower()
    return any(keyword in facilities_text for keyword in keywords)


def make_facility_flags(project: Dict) -> Dict[str, bool]:
    facilities = project.get("key_facilities", []) or []
    tenure = (project.get("tenure") or "").lower()

    return {
        "have_freehold": tenure == "freehold",
        "have_leasehold": tenure == "leasehold",
        "have_infinity_pool": detect_bool(["pool", "onsen"], facilities),
        "have_pets_allowed": detect_bool(["pet"], facilities),
        "have_guard_house": detect_bool(["security", "guard", "cctv"], facilities),
        "have_sauna": detect_bool(["sauna"], facilities),
        "have_sky_lounge": detect_bool(["sky", "rooftop"], facilities),
        "have_grocery": detect_bool(["shop", "retail", "grocery"], facilities),
        "have_fitness_area": detect_bool(["fitness", "gym"], facilities),
    }


def km_from_meters(distance_meters: Optional[float]) -> float:
    if not distance_meters:
        return 0.0
    return round(float(distance_meters) / 1000, 2)


def as_form_values(payload: Dict[str, object]) -> Dict[str, str]:
    form: Dict[str, str] = {}
    for key, value in payload.items():
        if value is None:
            continue
        if isinstance(value, bool):
            form[key] = "true" if value else "false"
        else:
            form[key] = str(value)
    return form


def open_file_tuples(field_name: str, paths: Iterable[Path]) -> Tuple[List[Tuple[str, Tuple[str, object, str]]], List[object]]:
    files: List[Tuple[str, Tuple[str, object, str]]] = []
    handles: List[object] = []
    for path in paths:
        if not path.exists():
            raise ScriptError(f"Required media file missing: {path}")
        handle = path.open("rb")
        handles.append(handle)
        mime_type = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
        files.append((field_name, (path.name, handle, mime_type)))
    return files, handles


def list_media_files(directory: Path, extensions: Iterable[str]) -> List[Path]:
    if not directory.exists():
        return []
    extensions = {ext.lower() for ext in extensions}
    return sorted(
        [
            path
            for path in directory.iterdir()
            if path.is_file() and path.suffix.lower() in extensions
        ]
    )


def pick_random_media(directory: Path, extensions: Iterable[str], fallback: Path) -> Path:
    files = list_media_files(directory, extensions)
    if files:
        return random.choice(files)
    if fallback.exists():
        return fallback
    raise ScriptError(f"No media available. Provide files in {directory} or restore fallback {fallback}.")


@dataclass
class APIClient:
    base_url: str
    auth_mode: str
    username: Optional[str]
    password: Optional[str]
    token: Optional[str]

    def __post_init__(self) -> None:
        self.base_url = self.base_url.rstrip("/")
        self.session: Session = requests.Session()
        self.auth = None

        if self.auth_mode == "basic":
            if not (self.username and self.password):
                raise ScriptError("Username and password are required for basic auth.")
            self.auth = HTTPBasicAuth(self.username, self.password)
        elif self.auth_mode == "token":
            token = self.token
            if not token:
                if not (self.username and self.password):
                    raise ScriptError("Token auth requires either --token or username/password to obtain it manually.")
                raise ScriptError("Token-based authentication is not automated. Pass --token to use an existing token.")
            self.session.headers["Authorization"] = f"Bearer {token}"
        else:
            raise ScriptError(f"Unsupported auth mode: {self.auth_mode}")

    def request(
        self,
        method: str,
        path: str,
        *,
        data: Optional[Dict[str, str]] = None,
        params: Optional[Dict[str, str]] = None,
        files: Optional[List[Tuple[str, Tuple[str, object, str]]]] = None,
    ) -> Response:
        url = f"{self.base_url}/{path.lstrip('/')}"
        response = self.session.request(method, url, data=data, params=params, files=files, auth=self.auth, timeout=60)
        return response

    def list_buildings(self, search: str) -> List[Dict]:
        response = self.request("GET", "/building/api/list/", params={"search": search})
        if response.status_code != 200:
            raise ScriptError(f"Failed to list buildings ({response.status_code}): {response.text}")
        payload = response.json()
        if isinstance(payload, dict) and "results" in payload:
            return payload["results"]
        if isinstance(payload, list):
            return payload
        raise ScriptError("Unexpected payload while listing buildings.")

    def create_building(self, payload: Dict[str, str], media_paths: Dict[str, List[Path]]) -> int:
        files, handles = self._prepare_files(media_paths)
        try:
            response = self.request("POST", "/building/api/create/", data=payload, files=files)
        finally:
            for handle in handles:
                handle.close()

        if response.status_code not in {200, 201}:
            raise ScriptError(f"Building create failed ({response.status_code}): {response.text}")

        data = response.json()
        building_id = data.get("id")
        if not building_id:
            raise ScriptError(f"Building created but ID missing in response: {data}")
        return building_id

    def create_unit(self, payload: Dict[str, str], media_paths: Dict[str, List[Path]]) -> int:
        files, handles = self._prepare_files(media_paths)
        try:
            response = self.request("POST", "/property/api/create/", data=payload, files=files)
        finally:
            for handle in handles:
                handle.close()

        if response.status_code not in {200, 201}:
            raise ScriptError(f"Property create failed ({response.status_code}): {response.text}")

        data = response.json()
        property_id = data.get("id")
        if not property_id:
            raise ScriptError(f"Property created but ID missing in response: {data}")
        return property_id

    @staticmethod
    def _prepare_files(media_paths: Dict[str, List[Path]]) -> Tuple[List[Tuple[str, Tuple[str, object, str]]], List[object]]:
        files: List[Tuple[str, Tuple[str, object, str]]] = []
        handles: List[object] = []
        for field_name, paths in media_paths.items():
            field_files, field_handles = open_file_tuples(field_name, paths)
            files.extend(field_files)
            handles.extend(field_handles)
        return files, handles


def build_building_payload(project: Dict) -> Dict[str, str]:
    slug = slugify(project["title"])
    nearest_transit = project.get("nearest_transit") or {}
    sub_type = project.get("sub_type") or ""
    if sub_type:
        mapped = RESIDENCE_SUB_TYPE_MAP.get(sub_type.lower())
        if mapped:
            sub_type = mapped

    payload = {
        "title": project["title"],
        "description": project.get("description"),
        "type": project.get("type") or "residence",
        "sub_type": sub_type,
        "total_units_for_sale": project.get("total_units") or 0,
        "address": project.get("address"),
        "project_total_area": project.get("project_total_area_sqm") or 0,
        "total_floors": project.get("total_floors") or 0,
        "facility_view": f"https://example.com/projects/{slug}/facility",
        "location_view": f"https://example.com/projects/{slug}/location",
        "lowest_price": project.get("lowest_price_thb") or 0,
        "highest_price": project.get("highest_price_thb") or 0,
        "latitude": project.get("latitude") or 0,
        "longitude": project.get("longitude") or 0,
        "province": project.get("province"),
        "district": project.get("district"),
        "sub_district": project.get("sub_district") or "",
        "status": "completed",
        "construction_year": project.get("completion_year") or 2000,
        "quota": "foreign",
        "furnishing": "fully",
        "distance_from_location_to_BTS_or_MRT": km_from_meters(nearest_transit.get("distance_m")),
        "distance_from_location_to_ARL": 0,
        "view": nearest_transit.get("station") or "City",
    }

    payload.update(make_facility_flags(project))
    return as_form_values(payload)


def build_building_media_map() -> Dict[str, List[Path]]:
    image = pick_random_media(MEDIA_PHOTO_DIR, IMAGE_EXTENSIONS, DEFAULT_BUILDING_IMAGE)
    floor_plan = pick_random_media(MEDIA_PHOTO_DIR, IMAGE_EXTENSIONS, DEFAULT_BUILDING_FLOOR_PLAN)
    master_plan = pick_random_media(MEDIA_PHOTO_DIR, IMAGE_EXTENSIONS, DEFAULT_BUILDING_MASTER_PLAN)
    video = pick_random_media(MEDIA_VIDEO_DIR, VIDEO_EXTENSIONS, DEFAULT_BUILDING_VIDEO)

    return {
        "images": [image],
        "unit_floor_plans": [floor_plan],
        "master_plans": [master_plan],
        "videos": [video],
        "aerial_drone_videos": [video],
    }


def build_unit_payload(unit: Dict, building_id: int) -> Dict[str, str]:
    balcony_direction = unit.get("balcony_direction")
    if not balcony_direction:
        balcony_direction = "Unknown"

    main_door_direction = unit.get("main_door_direction")
    if not main_door_direction:
        main_door_direction = "Unknown"

    payload = {
        "building": building_id,
        "unit_id": unit.get("unit_id"),
        "title": unit.get("title"),
        "description": unit.get("description"),
        "price": unit.get("sale_price_thb") or 0,
        "price_per_sqm": unit.get("price_per_sqm_thb") or 0,
        "floor_number": unit.get("floor_number"),
        "unit_area": unit.get("unit_area_sqm") or 0,
        "interior_view": unit.get("interior_view"),
        "number_of_bedroom": unit.get("number_of_bedroom") or 0,
        "number_of_bathroom": unit.get("number_of_bathroom") or 0,
        "number_of_balcony": unit.get("number_of_balcony") or 0,
        "number_of_car_parking": unit.get("number_of_car_parking") or 0,
        "balcony_direction": balcony_direction,
        "main_door_direction": main_door_direction,
        "unit_position": unit.get("unit_position") or "center",
        "have_tenant_occupied": unit.get("have_tenant_occupied", False),
        "tenant_occupied_validity": unit.get("tenant_occupied_validity"),
        "have_vacant": unit.get("have_vacant", True),
        "have_owner_occupied": unit.get("have_owner_occupied", False),
        "have_bathtub": unit.get("have_bathtub", False),
        "have_duplex": unit.get("have_duplex", False),
    }
    return as_form_values(payload)


def build_unit_media_map() -> Dict[str, List[Path]]:
    image = pick_random_media(MEDIA_PHOTO_DIR, IMAGE_EXTENSIONS, DEFAULT_PROPERTY_IMAGE)
    video = pick_random_media(MEDIA_VIDEO_DIR, VIDEO_EXTENSIONS, DEFAULT_PROPERTY_VIDEO)

    return {
        "images": [image],
        "videos": [video],
        "interior_virtual_tours": [video],
    }


def ensure_media_placeholders() -> None:
    photo_pool = list_media_files(MEDIA_PHOTO_DIR, IMAGE_EXTENSIONS)
    video_pool = list_media_files(MEDIA_VIDEO_DIR, VIDEO_EXTENSIONS)

    image_defaults = [
        DEFAULT_BUILDING_IMAGE,
        DEFAULT_BUILDING_FLOOR_PLAN,
        DEFAULT_BUILDING_MASTER_PLAN,
        DEFAULT_PROPERTY_IMAGE,
    ]
    video_defaults = [DEFAULT_BUILDING_VIDEO, DEFAULT_PROPERTY_VIDEO]

    missing_image_defaults = [path for path in image_defaults if not path.exists()]
    missing_video_defaults = [path for path in video_defaults if not path.exists()]

    if not photo_pool and missing_image_defaults:
        missing_str = "\n  ".join(str(path) for path in missing_image_defaults)
        raise ScriptError(
            "No project photos available. Add images to docs/media/photo or restore fallback files:\n  "
            + missing_str
        )

    if not video_pool and missing_video_defaults:
        missing_str = "\n  ".join(str(path) for path in missing_video_defaults)
        raise ScriptError(
            "No project videos available. Add videos to docs/media/video or restore fallback files:\n  "
            + missing_str
        )

    if missing_image_defaults:
        print(
            "[WARN] Image placeholder files are missing; using random media pool exclusively.",
            file=sys.stderr,
        )

    if missing_video_defaults:
        print(
            "[WARN] Video placeholder files are missing; using random media pool exclusively.",
            file=sys.stderr,
        )


def parse_args(argv: Optional[List[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Submit researched buildings and units through the API.")
    parser.add_argument("--base-url", default="http://0.0.0.0:8000/", help="Root URL of the API (default: http://0.0.0.0:8000/)")
    parser.add_argument("--username", help="Developer or agent username for authentication.")
    parser.add_argument("--password", help="Password for authentication.")
    parser.add_argument("--auth-mode", choices=["basic", "token"], default="basic", help="Authentication scheme to use.")
    parser.add_argument("--token", help="Bearer token for token auth mode.")
    parser.add_argument("--skip-existing", action="store_true", help="Skip buildings that already exist (matched by title search).")
    parser.add_argument("--dry-run", action="store_true", help="Print the payloads without calling the API.")
    return parser.parse_args(argv)


def main(argv: Optional[List[str]] = None) -> int:
    args = parse_args(argv)

    ensure_media_placeholders()

    projects = load_json(PROJECTS_PATH)
    units_entries = load_json(UNITS_PATH)
    units_by_slug = {entry["project_slug"]: entry["units"] for entry in units_entries}

    client = APIClient(
        base_url=args.base_url,
        auth_mode=args.auth_mode,
        username=args.username,
        password=args.password,
        token=args.token,
    )

    building_media = build_building_media_map()
    unit_media = build_unit_media_map()

    created_buildings: Dict[str, int] = {}

    for project in projects:
        slug = slugify(project["title"])
        units = units_by_slug.get(slug)
        if units is None:
            print(f"[WARN] No units found for project '{project['title']}' (slug: {slug}); skipping unit creation.", file=sys.stderr)

        if args.skip_existing:
            existing = client.list_buildings(project["title"])
            candidate = next((item for item in existing if item.get("title") == project["title"]), None)
            if candidate:
                building_id = candidate.get("id")
                if building_id:
                    print(f"[SKIP] Building '{project['title']}' already exists (id={building_id}).")
                    created_buildings[slug] = building_id
                    continue

        payload = build_building_payload(project)
        if args.dry_run:
            print(f"[DRY-RUN] Would create building '{project['title']}' with payload: {payload}")
            created_buildings[slug] = -1
        else:
            building_id = client.create_building(payload, building_media)
            created_buildings[slug] = building_id
            print(f"[OK] Created building '{project['title']}' (id={building_id}).")

        if not units:
            continue

        for unit in units:
            if args.dry_run:
                payload = build_unit_payload(unit, created_buildings[slug])
                print(f"  [DRY-RUN] Would create unit '{unit.get('title')}' for building slug {slug} with payload: {payload}")
                continue

            payload = build_unit_payload(unit, created_buildings[slug])
            property_id = client.create_unit(payload, unit_media)
            print(f"  [OK] Created unit '{unit.get('title')}' (id={property_id}).")

    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except ScriptError as exc:
        print(f"[ERROR] {exc}", file=sys.stderr)
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n[ABORTED] Interrupted by user.", file=sys.stderr)
        sys.exit(130)

