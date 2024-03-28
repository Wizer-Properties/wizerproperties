from django.shortcuts import render
from django.contrib.auth.decorators import login_required



@login_required
def create_reels(request):
    return render(request, "create-reels.html")