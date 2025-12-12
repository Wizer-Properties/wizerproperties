# Generated manually for SavedSearch model

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('property', '0042_discountproperty_created_by_and_more'),
        ('user', '0015_agentprofile_credit_balance_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='SavedSearch',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(help_text="User-friendly name for this saved search (e.g., '2BR Condos in Sukhumvit')", max_length=200)),
                ('search_params', models.JSONField(default=dict, help_text='JSON object containing all search parameters (filters, place, ordering, etc.)')),
                ('is_active', models.BooleanField(default=True, help_text='Whether this saved search is active (users can deactivate without deleting)')),
                ('prospect', models.ForeignKey(help_text='The prospect who saved this search', on_delete=django.db.models.deletion.CASCADE, related_name='saved_searches', to='user.prospectprofile')),
            ],
            options={
                'verbose_name': 'Saved Search',
                'verbose_name_plural': 'Saved Searches',
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddConstraint(
            model_name='savedsearch',
            constraint=models.UniqueConstraint(fields=('prospect', 'name'), name='unique_prospect_search_name'),
        ),
    ]

