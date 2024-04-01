from django.shortcuts import render
from django.contrib.auth.decorators import login_required



@login_required
def create_reels(request):
    context = {
        "action_type" : "create",
        "reel_id" : None
    }
    return render(request, "create-edit-reels.html", context)


@login_required
def edit_reels(request, id):
    context = {
        "action_type" : "edit",
        "reel_id" : id
    }
    return render(request, "create-edit-reels.html", context)