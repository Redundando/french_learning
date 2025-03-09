from rest_framework import serializers
from vocabulary.models import Category, Vocabulary, UserPerformance


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']


class VocabularySerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Vocabulary
        fields = ['id', 'french_word', 'german_word', 'category', 'category_name']


class UserPerformanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPerformance
        fields = ['id', 'vocabulary', 'direction', 'user_answer',
                  'similarity_score', 'is_correct', 'timestamp']