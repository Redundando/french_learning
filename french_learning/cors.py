"""CORS Configuration for Django"""


class CorsConfig:
    """Helper class to organize CORS settings"""

    @staticmethod
    def apply_settings(settings_dict):
        """Apply CORS settings to the provided settings dictionary"""
        # Add corsheaders to installed apps
        if 'corsheaders' not in settings_dict['INSTALLED_APPS']:
            settings_dict['INSTALLED_APPS'].append('corsheaders')

        # Add CORS middleware at the top of the list
        if 'corsheaders.middleware.CorsMiddleware' not in settings_dict['MIDDLEWARE']:
            settings_dict['MIDDLEWARE'].insert(0, 'corsheaders.middleware.CorsMiddleware')

        # Configure CORS settings
        settings_dict['CORS_ALLOW_ALL_ORIGINS'] = True  # For development only
        settings_dict['CORS_ALLOWED_ORIGINS'] = [
                "http://localhost:3000",
                "http://127.0.0.1:3000",
        ]
        settings_dict['CORS_ALLOW_CREDENTIALS'] = True
        settings_dict['CORS_ALLOW_METHODS'] = [
                'DELETE',
                'GET',
                'OPTIONS',
                'PATCH',
                'POST',
                'PUT',
        ]
        settings_dict['CORS_ALLOW_HEADERS'] = [
                'accept',
                'accept-encoding',
                'authorization',
                'content-type',
                'dnt',
                'origin',
                'user-agent',
                'x-csrftoken',
                'x-requested-with',
        ]

        return settings_dict