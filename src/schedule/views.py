from django.shortcuts import render
from django.contrib.auth.decorators import login_required

# Create your views here.
@login_required
def create_schedule(request):
    return render(request, "create_schedule.html")