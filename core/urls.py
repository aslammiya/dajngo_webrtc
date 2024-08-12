from django.contrib import admin
from django.urls import path
from home.views import *

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', index),
    path('',index, name='index'),
    path('video/<str:room>/<str:created>/', video,name='video')
]
