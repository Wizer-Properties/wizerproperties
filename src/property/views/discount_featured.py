from typing import Any, Optional, Union, TYPE_CHECKING
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import date

from property.models import Property, DiscountProperty, FeatureProperty
from user.models import AgentProfile, DeveloperProfile
from utils.admin_settings import get_discount_property_cost, get_featured_property_cost

if TYPE_CHECKING:
    from django.http import HttpRequest, HttpResponse


def get_user_profile(request: "HttpRequest") -> Optional[Union[AgentProfile, DeveloperProfile]]:
    """
    Get the user's profile (agent or developer) and credit balance.
    
    Args:
        request: Django HttpRequest object with authenticated user.
    
    Returns:
        AgentProfile or DeveloperProfile: User's profile object, or None if user type is invalid.
    """
    user = request.user
    if not user.is_authenticated:
        return None
    if user.user_type == "agent":
        return getattr(user, 'agentprofile', None)
    elif user.user_type == "developer":
        return getattr(user, 'developerprofile', None)
    return None


@login_required
def discount_property_list(request: "HttpRequest") -> "HttpResponse":
    """List all discount properties created by the current user"""
    user = request.user
    if not user.is_authenticated or user.user_type not in ['agent', 'developer']:
        messages.error(request, "Access denied. Only agents and developers can access this page.")
        return redirect('/dashboard/')
    
    discount_properties = DiscountProperty.objects.filter(created_by=user).select_related('property', 'property__building').order_by('period')
    
    context = {
        'discount_properties': discount_properties,
        'page_title': 'Discount Properties',
        'property_type': 'discount',
        'today_date': timezone.now().date()
    }
    return render(request, 'property/discount_featured_list.html', context)


@login_required
def featured_property_list(request: "HttpRequest") -> "HttpResponse":
    """List all featured properties created by the current user"""
    user = request.user
    if not user.is_authenticated or user.user_type not in ['agent', 'developer']:
        messages.error(request, "Access denied. Only agents and developers can access this page.")
        return redirect('/dashboard/')
    
    featured_properties = FeatureProperty.objects.filter(created_by=user).select_related('property', 'property__building').order_by('expiry_date')
    
    context = {
        'featured_properties': featured_properties,
        'page_title': 'Featured Properties',
        'property_type': 'featured',
        'today_date': timezone.now().date()
    }
    return render(request, 'property/discount_featured_list.html', context)


@login_required
def create_discount_property(request: "HttpRequest") -> "HttpResponse":
    """Create a new discount property"""
    user = request.user
    if not user.is_authenticated or user.user_type not in ['agent', 'developer']:
        messages.error(request, "Access denied. Only agents and developers can access this page.")
        return redirect('/dashboard/')
    
    user_profile = get_user_profile(request)
    if not user_profile:
        messages.error(request, "User profile not found.")
        return redirect('/dashboard/')
    
    # Get cost for creating discount property
    discount_cost = get_discount_property_cost()
    
    # Get properties owned by the user that are not already in discount or featured lists
    available_properties = Property.objects.filter(
        created_by=user,
        is_active=True
    ).exclude(
        discounts__isnull=False
    ).exclude(
        features__isnull=False
    ).select_related('building')
    
    if request.method == 'POST':
        property_id = request.POST.get('property')
        expiry_date = request.POST.get('expiry_date')
        
        if not property_id or not expiry_date:
            messages.error(request, "Please select a property and expiry date.")
        else:
            try:
                property_obj = get_object_or_404(Property, id=property_id, created_by=user)
                expiry_date_obj = date.fromisoformat(expiry_date)
                
                if expiry_date_obj < date.today():
                    messages.error(request, "Expiry date must be in the future.")
                else:
                        # Check if user has enough credits
                        if user_profile.credit_balance < discount_cost:
                            messages.error(request, f"Insufficient credits. You need {discount_cost} credits but only have {user_profile.credit_balance}.")
                        else:
                            # Deduct credits and create discount property
                            user_profile.credit_balance = float(user_profile.credit_balance) - float(discount_cost)
                            user_profile.save()
                        
                        discount_property = DiscountProperty.objects.create(
                            property=property_obj,
                            period=expiry_date_obj,
                            created_by=user
                        )
                        messages.success(request, f"Discount property '{property_obj.title}' created successfully! {discount_cost} credits deducted.")
                        return redirect('property:discount_list')
                    
            except ValueError:
                messages.error(request, "Invalid date format.")
            except ValidationError as e:
                messages.error(request, f"Error: {e}")
    
    context = {
        'available_properties': available_properties,
        'page_title': 'Create Discount Property',
        'property_type': 'discount',
        'discount_cost': discount_cost,
        'user_credit_balance': user_profile.credit_balance,
        'can_afford': user_profile.credit_balance >= discount_cost
    }
    return render(request, 'property/create_discount_featured.html', context)


@login_required
def create_featured_property(request: "HttpRequest") -> "HttpResponse":
    """Create a new featured property"""
    user = request.user
    if not user.is_authenticated or user.user_type not in ['agent', 'developer']:
        messages.error(request, "Access denied. Only agents and developers can access this page.")
        return redirect('/dashboard/')
    
    user_profile = get_user_profile(request)
    if not user_profile:
        messages.error(request, "User profile not found.")
        return redirect('/dashboard/')
    
    # Get cost for creating featured property
    featured_cost = get_featured_property_cost()
    
    # Get properties owned by the user that are not already in discount or featured lists
    available_properties = Property.objects.filter(
        created_by=user,
        is_active=True
    ).exclude(
        discounts__isnull=False
    ).exclude(
        features__isnull=False
    ).select_related('building')
    
    if request.method == 'POST':
        property_id = request.POST.get('property')
        expiry_date = request.POST.get('expiry_date')
        
        if not property_id or not expiry_date:
            messages.error(request, "Please select a property and expiry date.")
        else:
            try:
                property_obj = get_object_or_404(Property, id=property_id, created_by=user)
                expiry_date_obj = date.fromisoformat(expiry_date)
                
                if expiry_date_obj < date.today():
                    messages.error(request, "Expiry date must be in the future.")
                else:
                        # Check if user has enough credits
                        if user_profile.credit_balance < featured_cost:
                            messages.error(request, f"Insufficient credits. You need {featured_cost} credits but only have {user_profile.credit_balance}.")
                        else:
                            # Deduct credits and create featured property
                            user_profile.credit_balance = float(user_profile.credit_balance) - float(featured_cost)
                            user_profile.save()
                        
                        featured_property = FeatureProperty.objects.create(
                            property=property_obj,
                            expiry_date=expiry_date_obj,
                            created_by=user
                        )
                        messages.success(request, f"Featured property '{property_obj.title}' created successfully! {featured_cost} credits deducted.")
                        return redirect('property:featured_list')
                    
            except ValueError:
                messages.error(request, "Invalid date format.")
            except ValidationError as e:
                messages.error(request, f"Error: {e}")
    
    context = {
        'available_properties': available_properties,
        'page_title': 'Create Featured Property',
        'property_type': 'featured',
        'featured_cost': featured_cost,
        'user_credit_balance': user_profile.credit_balance,
        'can_afford': user_profile.credit_balance >= featured_cost
    }
    return render(request, 'property/create_discount_featured.html', context)


@login_required
def delete_discount_property(request: "HttpRequest", discount_id: int) -> "HttpResponse":
    """Delete a discount property"""
    user = request.user
    if not user.is_authenticated or user.user_type not in ['agent', 'developer']:
        messages.error(request, "Access denied. Only agents and developers can access this page.")
        return redirect('/dashboard/')
    
    discount_property = get_object_or_404(DiscountProperty, id=discount_id, created_by=user)
    
    if request.method == 'POST':
        property_title = discount_property.property.title if discount_property.property else 'Unknown'
        discount_property.delete()
        messages.success(request, f"Discount property '{property_title}' deleted successfully!")
        return redirect('property:discount_list')
    
    context = {
        'discount_property': discount_property,
        'property_type': 'discount'
    }
    return render(request, 'property/delete_discount_featured.html', context)


@login_required
def edit_discount_property(request: "HttpRequest", discount_id: int) -> "HttpResponse":
    """Edit an existing discount property"""
    user = request.user
    if not user.is_authenticated or user.user_type not in ['agent', 'developer']:
        messages.error(request, "Access denied. Only agents and developers can access this page.")
        return redirect('/dashboard/')
    
    discount_property = get_object_or_404(DiscountProperty, id=discount_id, created_by=user)
    
    if request.method == 'POST':
        expiry_date = request.POST.get('expiry_date')
        
        if not expiry_date:
            messages.error(request, "Please provide an expiry date.")
        else:
            try:
                expiry_date_obj = date.fromisoformat(expiry_date)
                
                if expiry_date_obj < date.today():
                    messages.error(request, "Expiry date must be in the future.")
                else:
                    discount_property.period = expiry_date_obj
                    discount_property.save()
                    messages.success(request, f"Discount property updated successfully!")
                    return redirect('property:discount_list')
                    
            except ValueError:
                messages.error(request, "Invalid date format.")
            except ValidationError as e:
                messages.error(request, f"Error: {e}")
    
    context = {
        'discount_property': discount_property,
        'page_title': 'Edit Discount Property',
        'property_type': 'discount'
    }
    return render(request, 'property/edit_discount_featured.html', context)


@login_required
def edit_featured_property(request: "HttpRequest", featured_id: int) -> "HttpResponse":
    """Edit an existing featured property"""
    user = request.user
    if not user.is_authenticated or user.user_type not in ['agent', 'developer']:
        messages.error(request, "Access denied. Only agents and developers can access this page.")
        return redirect('/dashboard/')
    
    featured_property = get_object_or_404(FeatureProperty, id=featured_id, created_by=user)
    
    if request.method == 'POST':
        expiry_date = request.POST.get('expiry_date')
        
        if not expiry_date:
            messages.error(request, "Please provide an expiry date.")
        else:
            try:
                expiry_date_obj = date.fromisoformat(expiry_date)
                
                if expiry_date_obj < date.today():
                    messages.error(request, "Expiry date must be in the future.")
                else:
                    featured_property.expiry_date = expiry_date_obj
                    featured_property.save()
                    messages.success(request, f"Featured property updated successfully!")
                    return redirect('property:featured_list')
                    
            except ValueError:
                messages.error(request, "Invalid date format.")
            except ValidationError as e:
                messages.error(request, f"Error: {e}")
    
    context = {
        'featured_property': featured_property,
        'page_title': 'Edit Featured Property',
        'property_type': 'featured'
    }
    return render(request, 'property/edit_discount_featured.html', context)


@login_required
def delete_featured_property(request: "HttpRequest", featured_id: int) -> "HttpResponse":
    """Delete a featured property"""
    user = request.user
    if not user.is_authenticated or user.user_type not in ['agent', 'developer']:
        messages.error(request, "Access denied. Only agents and developers can access this page.")
        return redirect('/dashboard/')
    
    featured_property = get_object_or_404(FeatureProperty, id=featured_id, created_by=user)
    
    if request.method == 'POST':
        property_title = featured_property.property.title if featured_property.property else 'Unknown'
        featured_property.delete()
        messages.success(request, f"Featured property '{property_title}' deleted successfully!")
        return redirect('property:featured_list')
    
    context = {
        'featured_property': featured_property,
        'property_type': 'featured'
    }
    return render(request, 'property/delete_discount_featured.html', context)
