{
    'name': 'Multiple Tab Restriction',
    'version': '19.0.1.0.0',
    'summary': 'Prevent multiple Odoo tabs and secure user sessions with smart duplicate tab detection',

    'description': """
Multiple Tab Restriction helps businesses secure Odoo user sessions by preventing users from opening multiple tabs simultaneously.

This module automatically detects duplicate Odoo tabs in real time and displays a modern popup warning to block additional sessions.

Main Features:
- Real-time duplicate tab detection
- Prevent multiple Odoo tabs instantly
- Modern popup warning interface
- Secure single active session enforcement
- Improves data consistency and security
- Reduces accidental duplicate operations
- Lightweight and fast client-side detection
- Admin bypass support
- Clean and premium UI experience
- No server load or extra configuration required

Benefits:
- Prevent data conflicts
- Improve user session security
- Reduce duplicate form submissions
- Better Odoo performance
- Clean enterprise workflow management

Perfect for companies, enterprises, ERP environments, and organizations that require secure and controlled Odoo session management.
    """,

    'category': 'Tools',
    'author': 'Envision Technolabs',
    'maintainer': 'Envision Technolabs',
    'website': 'https://www.envisiontechnolabs.com',
    'license': 'LGPL-3',
    'depends': ['web'],

    'images': [
        'static/description/banner.png',
    ],

    'assets': {
        'web.assets_backend': [
            'multiple_tab_restrictions/static/src/js/single_tab_advanced.js',
        ],
    },

    'installable': True,
    'application': True,
    'auto_install': False,
}
