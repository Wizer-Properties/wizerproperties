from django.core.management.base import BaseCommand
from django.utils import timezone
from blog.models import Post, Category
from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from faker import Faker
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Create dummy blog posts'

    def add_arguments(self, parser):
        parser.add_argument('total', type=int, help='Indicates the number of blog posts to be created')

    def handle(self, *args, **options):
        total = options['total']
        fake = Faker()

        # Ensure we have at least one user and category
        user = User.objects.all().first()
        
        Post.objects.all().delete()
        
        

        for _ in range(total):
            title = fake.sentence(nb_words=6)
            content = '\n\n'.join(fake.paragraphs(nb=5))
            subtitle = fake.sentence(nb_words=10)
            
            category = Category.objects.filter(id=random.randint(1, 6)).first()
            
            post = Post.objects.create(
                title=title,
                description=content,
                subtitle=subtitle,
                creator=user,
                status='published'
            )
            
            # Add category
            post.categories.add(category)

            # Create dummy banner image
            image_file = ContentFile(fake.image())
            file_name = f'blog_banner_{post.id}.jpg'
            post.banner_image.save(file_name, image_file, save=True)

        self.stdout.write(self.style.SUCCESS(f'Successfully created {total} dummy blog posts'))
