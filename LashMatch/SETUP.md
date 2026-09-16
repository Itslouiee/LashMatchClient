# LashMatch

## Open locally
Start MySQL in XAMPP. From this project directory run:

    C:\xampp\php\php.exe -S 127.0.0.1:8080 -t .

Open http://localhost:8080/landingpage.html.

For Apache, place this folder under the active document root (normally C:\xampp\htdocs\LashMatch),
start Apache, and open http://localhost/LashMatch/landingpage.html.
This current workspace is in a backup folder, so Apache may not serve it automatically.

## Landing page layout

The landing page uses live HTML text and controls with a responsive, viewport-height CSS grid.
The supplied reference.png is cropped within SVG photo panels for the hero, map, and studio.
Text inside that artwork retains its original image resolution; headings, navigation, descriptions,
and action buttons are browser-rendered text. The page does not scroll; dialogs scroll independently.
On narrow screens the hero artwork becomes a subtle background and the studio card is hidden.
On very short screens the studio section is hidden; studio search remains available from the hero.

## Database
The local lashmatch database was created previously. For another machine, import database.sql
through phpMyAdmin. The import preserves records and does not duplicate supplied seed rows.

config.php defaults: 127.0.0.1:3306, database lashmatch, root user, empty password.
Override with LASHMATCH_DB_HOST, LASHMATCH_DB_PORT, LASHMATCH_DB_NAME,
LASHMATCH_DB_USER, and LASHMATCH_DB_PASSWORD environment variables.

Tables: users, lash_styles, studios, lash_matches, auth_attempts.

## Interactions
- Login and Sign Up open account forms; once signed in, either opens the account dialog.
- Get Started opens the lash quiz. Signed-in users can save results to MySQL.
- Studio buttons and the map open a searchable directory.
- Features, How It Works, and About open information dialogs.
- Try It On opens the style guide. Camera-based virtual try-on is not implemented.
- Watch Video shows a missing-video message because no video asset has been supplied.

Studio records are fictional samples. The map and counts are part of the supplied artwork,
not live location data or verified metrics. No booking, email verification, password recovery,
or saved-result history screen is included.

The API retains password hashing, prepared queries, CSRF checks, session regeneration,
validation, and authentication throttling. Use HTTPS and dedicated database credentials
before a public deployment.

## Verified reference update
- Copied image SHA-256 matches the Downloads original.
- Browser screenshot at 1752 x 986 matches the original pixel for pixel.
- Login/signup dialogs, quiz, studio search, style guide, and missing-video message work.
- Image proportions and no horizontal overflow checked at 1440, 768, 390, and 320 pixels.
- No JavaScript runtime exceptions during browser checks.
- Updated preview-desktop.png and preview-mobile.png.
