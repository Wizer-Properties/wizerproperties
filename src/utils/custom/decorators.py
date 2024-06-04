from functools import wraps
from django.shortcuts import redirect


def prospect_profile_required(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if not hasattr(request.user, "prospectprofile"):
            return redirect("/")
        return view_func(request, *args, **kwargs)

    return _wrapped_view
