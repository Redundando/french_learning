import csv
import io
from django.shortcuts import render, redirect
from django.contrib import messages
from django.views.decorators.csrf import csrf_protect
from django.contrib.auth.decorators import login_required
from vocabulary.models import Category, Vocabulary


@login_required
@csrf_protect
def import_vocabulary(request):
    """Custom view for importing vocabulary from CSV file"""
    context = {}

    if request.method == 'POST':
        csv_file = request.FILES.get('csv_file')
        if not csv_file:
            messages.error(request, 'Please upload a CSV file')
            return render(request, 'admin/vocabulary_import.html', context)

        if not csv_file.name.endswith('.csv'):
            messages.error(request, 'File must be a CSV')
            return render(request, 'admin/vocabulary_import.html', context)

        # Read the file
        try:
            csv_data = csv_file.read().decode('utf-8')
            csv_reader = csv.DictReader(io.StringIO(csv_data))

            # Statistics counters
            categories_created = 0
            words_created = 0
            words_updated = 0
            errors = 0

            # Process each row
            for row in csv_reader:
                try:
                    # Get required fields from CSV
                    french_word = row.get('Französisch', '').strip()
                    german_word = row.get('Deutsch', '').strip()
                    category_name = row.get('Kategorie', '').strip()

                    if not french_word or not german_word:
                        errors += 1
                        continue

                    # Get or create category
                    category, category_created = Category.objects.get_or_create(name=category_name)
                    if category_created:
                        categories_created += 1

                    # Get or create vocabulary
                    vocab, created = Vocabulary.objects.update_or_create(
                            french_word=french_word,
                            defaults={
                                    'german_word': german_word,
                                    'category'   : category,
                            }
                    )

                    if created:
                        words_created += 1
                    else:
                        words_updated += 1

                except Exception as e:
                    print(f"Error processing row: {e}")
                    errors += 1

            # Report success
            messages.success(
                    request,
                    f'Import completed: {categories_created} categories created, '
                    f'{words_created} words created, {words_updated} words updated, '
                    f'{errors} errors'
            )
            return redirect('admin:vocabulary_vocabulary_changelist')

        except Exception as e:
            messages.error(request, f'Error processing file: {str(e)}')

    return render(request, 'admin/vocabulary_import.html', context)