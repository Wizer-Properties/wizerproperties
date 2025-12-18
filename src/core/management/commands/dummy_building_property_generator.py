from typing import Any, Optional, List
from django.core.management.base import BaseCommand
from django.db import transaction
from faker import Faker
import random

# Models
from building.models import default as building_models
from property.models import default as property_models
from user.models import User

# Choices/constants
from utils.general_data import (
    BUILDING_TYPES,
    COMMERCIAL_SUB_TYPES,
    RESIDENCE_SUB_TYPES,
    BUILDING_STATUS,
    QUOTA_TYPES,
    FURNISHING_TYPES,
    UNIT_POSITION_TYPES,
)


class Command(BaseCommand):
    help = 'Create dummy Buildings and Properties'
    
    """example command: sudo docker compose -f docker-compose-dev.yml run web python manage.py dummy_building_property_generator --buildings 55 --properties-per-building 10 --created-by-user-id 1
    """

    def add_arguments(self, parser: Any) -> None:
        parser.add_argument('--buildings', type=int, default=5, help='Number of buildings to create')
        parser.add_argument('--properties-per-building', type=int, default=5, help='Number of properties per building')
        parser.add_argument('--created-by-user-id', type=int, default=None, help='User ID to set as created_by')

    def _get_random_choice_key(self, choices: Any) -> Any:
        # choices is list/tuple of (key, label)
        keys = [c[0] for c in choices]
        return random.choice(keys)

    def _pick_created_by(self, explicit_user_id: Optional[int]) -> Optional[User]:
        if explicit_user_id:
            try:
                return User.objects.get(id=explicit_user_id)
            except User.DoesNotExist:
                return None
        # try grab any user if available
        return User.objects.order_by('?').first()

    @transaction.atomic
    def handle(self, *args: Any, **options: Any) -> None:
        num_buildings = max(0, options.get('buildings') or 0)
        num_props_per_building = max(0, options.get('properties_per_building') or 0)
        locale = 'en_US'
        created_by = self._pick_created_by(options.get('created_by_user_id'))

        fake = Faker(locale)

        created_buildings = []
        created_properties_count = 0

        for _ in range(num_buildings):
            building_type_key = self._get_random_choice_key(BUILDING_TYPES)
            if building_type_key == 'residence':
                sub_type_key = self._get_random_choice_key(RESIDENCE_SUB_TYPES)
            else:
                sub_type_key = self._get_random_choice_key(COMMERCIAL_SUB_TYPES)

            lowest_price = random.randint(1_000_000, 10_000_000)
            highest_price = lowest_price + random.randint(100_000, 20_000_000)

            building = building_models.Building.objects.create(
                title=fake.street_name(),
                description=fake.text(max_nb_chars=300),
                lowest_price=lowest_price,
                highest_price=highest_price,
                type=building_type_key,
                sub_type=sub_type_key,
                status=self._get_random_choice_key(BUILDING_STATUS),
                construction_year=random.randint(2000, 2025),
                total_units_for_sale=random.randint(10, 300),
                province=fake.state(),
                district=fake.city(),
                sub_district=fake.city_suffix(),
                address=fake.address(),
                latitude=float(fake.latitude()),
                longitude=float(fake.longitude()),
                project_total_area=random.uniform(1000.0, 500000.0),
                total_floors=random.randint(1, 70),
                quota=self._get_random_choice_key(QUOTA_TYPES),
                furnishing=self._get_random_choice_key(FURNISHING_TYPES),
                distance_from_location_to_BTS_or_MRT=random.uniform(0.0, 10.0),
                distance_from_location_to_ARL=random.uniform(0.0, 10.0),
                view=fake.word(),
                facility_view=fake.url(),
                location_view=fake.url(),
                have_freehold=fake.boolean(),
                have_leasehold=fake.boolean(),
                have_infinity_pool=fake.boolean(),
                have_pets_allowed=fake.boolean(),
                have_guard_house=fake.boolean(),
                have_sauna=fake.boolean(),
                have_sky_lounge=fake.boolean(),
                have_grocery=fake.boolean(),
                have_fitness_area=fake.boolean(),
                is_active=True,
                created_by=created_by,
            )

            created_buildings.append(building)

            # Properties for this building
            properties_to_create = []
            for i in range(num_props_per_building):
                price = random.randint(500_000, 50_000_000)
                unit_area = random.randint(20, 300)
                price_per_sqm = max(1, int(price / max(1, unit_area)))

                properties_to_create.append(
                    property_models.Property(
                        building=building,
                        unit_id=f"{building.id}-{i+1}",
                        title=fake.catch_phrase(),
                        description=fake.text(max_nb_chars=500),
                        price=price,
                        price_per_sqm=price_per_sqm,
                        floor_number=str(random.randint(1, max(1, building.total_floors or 1))),
                        unit_area=unit_area,
                        interior_view=fake.url(),
                        number_of_bedroom=random.randint(1, 6),
                        number_of_bathroom=random.randint(1, 5),
                        number_of_balcony=random.randint(1, 3),
                        number_of_car_parking=random.randint(1, 3),
                        balcony_direction=random.choice(['N', 'S', 'E', 'W', 'NE', 'NW', 'SE', 'SW']),
                        main_door_direction=random.choice(['N', 'S', 'E', 'W', 'NE', 'NW', 'SE', 'SW']),
                        unit_position=random.choice([c[0] for c in UNIT_POSITION_TYPES]) if UNIT_POSITION_TYPES else None,
                        have_tenant_occupied=fake.boolean(),
                        tenant_occupied_validity=None,
                        have_vacant=fake.boolean(),
                        have_owner_occupied=fake.boolean(),
                        have_bathtub=fake.boolean(),
                        have_duplex=fake.boolean(),
                        is_active=True,
                        created_by=created_by,
                    )
                )

            created = property_models.Property.objects.bulk_create(properties_to_create)
            created_properties_count += len(created)

        self.stdout.write(self.style.SUCCESS(
            f"Created {len(created_buildings)} buildings and {created_properties_count} properties"
        ))
