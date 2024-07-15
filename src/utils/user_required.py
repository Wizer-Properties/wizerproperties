from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect
from user.models import DeveloperProfile, AgentProfile

def developer_or_agent_required(view_func):
    # this decorator allow only developer and agent
    @login_required
    def _wrapped_view(request, *args, **kwargs):
        # if user has developer and agent profile
        if DeveloperProfile.objects.filter(user=request.user).exists() or AgentProfile.objects.filter(user=request.user).exists():
            return view_func(request, *args, **kwargs)
        else:
            return redirect('dashboard')
    return _wrapped_view