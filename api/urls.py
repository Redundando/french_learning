from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .audio_views import text_to_speech

router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet)
router.register(r'vocabulary', views.VocabularyViewSet)
router.register(r'performance', views.UserPerformanceViewSet, basename='performance')

urlpatterns = [
    path('', include(router.urls)),
    path('tts/', text_to_speech, name='text_to_speech'),
]