USER_TYPE = (("developer", "Developer"), ("agent", "Agent"), ("prospect", "Prospect"))

GENDER = (("male", "Male"), ("female", "Female"))

UNIQUE_PROFILE_EMAIL_MESSAGE = "Profile with this email already exists."

BUILDING_TYPES = (("condos", "Condos"), ("house", "House"))

QUOTA_TYPES = (("thai", "Thai"), ("foreign", "Foreign"))

FURNISHING_TYPES = (("partly", "Partly"), ("fully", "Fully"))

UNIT_POSITION_TYPES = (("left_corner", "Left Corner"), ("right_corner", "Right Corner"), ("center", "Center"))

BUILDING_MEDIA_TYPES = (
    ("image", "Image"),
    ("floor_plan", "Floor plan"),
    ("unit_floor_plan", "Unit floor plan"),
    ("master_plan", "Master plan"),
    ("video", "Video"),
)

PROPERTY_MEDIA_TYPES = (("image", "Image"), ("video", "Video"))

ALLOWED_IMAGE_EXTENSIONS = [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "bmp",
    "tiff",
    "webp",
    "svg",
    "heif",
    "bat",
    "raw",
    "indd",
    "ai",
]

ALLOWED_VIDEO_EXTENSIONS = ["mp4", "avi", "mov", "wmv", "mkv", "flv"]
