from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('advertise', '0018_add_new_ad_locations'),
    ]

    operations = [
        migrations.AlterField(
            model_name='advertisement',
            name='ad_location',
            field=models.CharField(
                choices=[
                    ('home', 'Home'),
                    ('home_mid', 'Home Mid-Page'),
                    ('search', 'Search'),
                    ('search_inline', 'Search Inline'),
                    ('details_topbar', 'Details Topbar'),
                    ('details_sidebar', 'Details Sidebar'),
                    ('details_developer_strip', 'Details Developer Strip'),
                    ('map_below', 'Map Below'),
                    ('blog', 'Blog'),
                ],
                max_length=25,
                null=True,
            ),
        ),
    ]
