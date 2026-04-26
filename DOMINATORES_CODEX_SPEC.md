# DOMINATORES — Spécification Complète du Projet
> Plateforme marocaine d'organisation d'événements (mariages, anniversaires, fêtes, événements professionnels)
> **Stack : Laravel (backend API) + React/Vite (frontend SPA) + SQLite**

---

## TABLE DES MATIÈRES
1. [Architecture du projet](#1-architecture-du-projet)
2. [Structure des dossiers](#2-structure-des-dossiers)
3. [Base de données — Migrations](#3-base-de-données--migrations)
4. [Modèles Eloquent](#4-modèles-eloquent)
5. [Middleware](#5-middleware)
6. [Services](#6-services)
7. [Contrôleurs API](#7-contrôleurs-api)
8. [Routes API](#8-routes-api)
9. [Seeders](#9-seeders)
10. [Frontend — Configuration](#10-frontend--configuration)
11. [Frontend — Contexte et Hooks](#11-frontend--contexte-et-hooks)
12. [Frontend — Pages Auth](#12-frontend--pages-auth)
13. [Frontend — Composants Layout](#13-frontend--composants-layout)
14. [Frontend — Dashboard Client](#14-frontend--dashboard-client)
15. [Frontend — Dashboard Admin](#15-frontend--dashboard-admin)
16. [Frontend — Création d'événement](#16-frontend--création-dévénement)
17. [Frontend — Personnalisation de salle](#17-frontend--personnalisation-de-salle)
18. [Frontend — Composants Event](#18-frontend--composants-event)
19. [Frontend — Suggestions & Simulation](#19-frontend--suggestions--simulation)
20. [Frontend — Récapitulatif & Confirmation](#20-frontend--récapitulatif--confirmation)
21. [Frontend — Page d'accueil](#21-frontend--page-daccueil)
22. [Frontend — App.jsx & Routage](#22-frontend--appjsx--routage)
23. [Styles Globaux](#23-styles-globaux)
24. [Commandes d'installation](#24-commandes-dinstallation)

---

## 1. ARCHITECTURE DU PROJET

```
dominatores/
├── backend/          # Laravel API (port 8000)
└── frontend/         # React + Vite SPA (port 5173)
```

**Communication :** API REST JSON avec token Bearer (Laravel Sanctum)
**Auth :** Token stocké en localStorage, envoyé via `Authorization: Bearer <token>`
**Proxy dev :** Vite redirige `/api/*` → `http://localhost:8000/api/*`

---

## 2. STRUCTURE DES DOSSIERS

### Backend (`/backend`)
```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/
│   │   │   ├── AuthController.php
│   │   │   ├── EventController.php
│   │   │   ├── RoomController.php
│   │   │   ├── CateringController.php
│   │   │   ├── DecorationController.php
│   │   │   ├── PackController.php
│   │   │   ├── SuggestionController.php
│   │   │   └── AdminController.php
│   │   └── Middleware/
│   │       └── AdminMiddleware.php
│   ├── Models/
│   │   ├── User.php
│   │   ├── Event.php
│   │   ├── Room.php
│   │   ├── CateringItem.php
│   │   ├── EventCatering.php
│   │   ├── Pack.php
│   │   ├── PackCatering.php
│   │   ├── Decoration.php
│   │   └── RoomDecoration.php
│   └── Services/
│       └── EventPricingService.php
├── database/
│   ├── database.sqlite          ← créer ce fichier vide
│   ├── migrations/
│   └── seeders/
│       ├── CateringItemSeeder.php
│       ├── PackSeeder.php
│       └── DatabaseSeeder.php
└── routes/
    └── api.php
```

### Frontend (`/frontend/src`)
```
src/
├── api/
│   └── axios.js
├── components/
│   ├── common/
│   └── layout/
│       └── Navbar.jsx
│   └── event/
│       ├── CateringSection.jsx
│       ├── PackSection.jsx
│       └── RoomPreview.jsx
├── config/
│   └── roomOptions.js
├── context/
│   └── AuthContext.jsx
├── hooks/
│   └── useAuth.js
├── pages/
│   ├── Home.jsx
│   ├── Simulate.jsx
│   ├── Suggestions.jsx
│   ├── Auth/
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── Dashboard/
│   │   ├── ClientDashboard.jsx
│   │   └── AdminDashboard.jsx
│   └── Event/
│       ├── CreateEvent.jsx
│       ├── CustomizeRoom.jsx
│       └── EventSummary.jsx
├── styles/
│   └── index.css
├── App.jsx
└── main.jsx
```

---

## 3. BASE DE DONNÉES — MIGRATIONS

### `.env` (backend)
```env
APP_NAME=DOMINATORES
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/backend/database/database.sqlite

SANCTUM_STATEFUL_DOMAINS=localhost:5173
SESSION_DOMAIN=localhost
```

> **Note :** Remplacer `/absolute/path/to/` par le chemin réel. Créer le fichier `database/database.sqlite` vide.

---

### Migration : `users` (déjà existante — ajouter colonne `role`)

Modifier la migration users existante pour ajouter :
```php
// Dans create_users_table.php, ajouter dans Schema::create :
$table->string('role')->default('client'); // 'client' ou 'admin'
```

---

### Migration : `create_events_table.php`
```php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->string('event_type');
            $table->string('status')->default('draft'); // draft | confirmed | cancelled
            $table->integer('guest_count')->default(0);
            $table->decimal('budget', 10, 2)->nullable();
            $table->decimal('total_price', 10, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
```

---

### Migration : `create_rooms_table.php`
```php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->onDelete('cascade');
            $table->string('table_layout')->nullable();
            $table->string('decoration_style')->nullable();
            $table->string('lighting_style')->nullable();
            $table->json('custom_options')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};
```

---

### Migration : `create_catering_items_table.php`
```php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('catering_items', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price_per_person', 8, 2);
            $table->string('category'); // entrée | plat | dessert
            $table->string('image_url')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('catering_items');
    }
};
```

---

### Migration : `create_event_catering_table.php`
```php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('event_catering', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->onDelete('cascade');
            $table->foreignId('catering_item_id')->constrained()->onDelete('cascade');
            $table->integer('quantity')->default(1);
            $table->decimal('line_total', 10, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_catering');
    }
};
```

---

### Migration : `create_packs_table.php`
```php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('packs', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('event_type');
            $table->decimal('base_price', 10, 2);
            $table->string('decoration_style')->nullable();
            $table->string('lighting_style')->nullable();
            $table->string('table_layout')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('packs');
    }
};
```

---

### Migration : `create_pack_catering_table.php`
```php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('pack_catering', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pack_id')->constrained()->onDelete('cascade');
            $table->foreignId('catering_item_id')->constrained()->onDelete('cascade');
            $table->decimal('quantity_per_guest', 5, 2)->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pack_catering');
    }
};
```

---

### Migration : `create_decorations_table.php`
```php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('decorations', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type'); // table | mur | plafond | sol
            $table->decimal('price', 8, 2);
            $table->string('image_url')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('decorations');
    }
};
```

---

### Migration : `create_room_decorations_table.php`
```php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('room_decorations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained()->onDelete('cascade');
            $table->foreignId('decoration_id')->constrained()->onDelete('cascade');
            $table->integer('quantity')->default(1);
            $table->decimal('line_total', 10, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_decorations');
    }
};
```

---

## 4. MODÈLES ELOQUENT

### `app/Models/User.php`
```php
<?php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = ['name', 'email', 'password', 'role'];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = ['email_verified_at' => 'datetime'];

    public function events(): HasMany
    {
        return $this->hasMany(Event::class);
    }
}
```

---

### `app/Models/Event.php`
```php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Event extends Model
{
    protected $fillable = [
        'user_id', 'title', 'event_type', 'status',
        'guest_count', 'budget', 'total_price'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function room(): HasOne
    {
        return $this->hasOne(Room::class);
    }

    public function eventCaterings(): HasMany
    {
        return $this->hasMany(EventCatering::class);
    }
}
```

---

### `app/Models/Room.php`
```php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Room extends Model
{
    protected $fillable = [
        'event_id', 'table_layout', 'decoration_style',
        'lighting_style', 'custom_options'
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function roomDecorations(): HasMany
    {
        return $this->hasMany(RoomDecoration::class);
    }
}
```

---

### `app/Models/CateringItem.php`
```php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CateringItem extends Model
{
    protected $fillable = ['name', 'description', 'price_per_person', 'category', 'image_url', 'active'];

    public function eventCaterings(): HasMany
    {
        return $this->hasMany(EventCatering::class);
    }
}
```

---

### `app/Models/EventCatering.php`
```php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventCatering extends Model
{
    protected $fillable = ['event_id', 'catering_item_id', 'quantity', 'line_total'];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function cateringItem(): BelongsTo
    {
        return $this->belongsTo(CateringItem::class);
    }
}
```

---

### `app/Models/Pack.php`
```php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pack extends Model
{
    protected $fillable = [
        'name', 'description', 'event_type', 'base_price',
        'decoration_style', 'lighting_style', 'table_layout', 'active'
    ];

    public function packCaterings(): HasMany
    {
        return $this->hasMany(PackCatering::class);
    }
}
```

---

### `app/Models/PackCatering.php`
```php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PackCatering extends Model
{
    protected $fillable = ['pack_id', 'catering_item_id', 'quantity_per_guest'];

    public function pack(): BelongsTo
    {
        return $this->belongsTo(Pack::class);
    }

    public function cateringItem(): BelongsTo
    {
        return $this->belongsTo(CateringItem::class);
    }
}
```

---

### `app/Models/Decoration.php`
```php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Decoration extends Model
{
    protected $fillable = ['name', 'type', 'price', 'image_url', 'active'];

    public function roomDecorations(): HasMany
    {
        return $this->hasMany(RoomDecoration::class);
    }
}
```

---

### `app/Models/RoomDecoration.php`
```php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RoomDecoration extends Model
{
    protected $fillable = ['room_id', 'decoration_id', 'quantity', 'line_total'];

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function decoration(): BelongsTo
    {
        return $this->belongsTo(Decoration::class);
    }
}
```

---

## 5. MIDDLEWARE

### `app/Http/Middleware/AdminMiddleware.php`
```php
<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->user() && $request->user()->role === 'admin') {
            return $next($request);
        }
        return response()->json(['message' => 'Accès non autorisé.'], 403);
    }
}
```

> **Enregistrer dans `app/Http/Kernel.php`** sous `$routeMiddleware` :
> ```php
> 'admin' => \App\Http\Middleware\AdminMiddleware::class,
> ```

---

## 6. SERVICES

### `app/Services/EventPricingService.php`
```php
<?php
namespace App\Services;

use App\Models\Event;

class EventPricingService
{
    private static array $decoPrices = [
        'zellige'              => 15000,
        'traditionnel_marocain'=> 20000,
        'moderne'              => 12000,
    ];

    private static array $lightPrices = [
        'tamise'               => 2000,
        'spots'                => 3500,
        'lustres_traditionnels'=> 5000,
    ];

    private static array $layoutPrices = [
        'classique_rond'       => 1200,
        'rectangulaire'        => 1000,
        'u_shape'              => 2000,
        'cocktail'             => 800,
    ];

    public static function calculate(Event $event): void
    {
        $total = 0;

        $room = $event->room;
        if ($room) {
            $total += self::$decoPrices[$room->decoration_style]  ?? 0;
            $total += self::$lightPrices[$room->lighting_style]   ?? 0;
            $total += self::$layoutPrices[$room->table_layout]    ?? 0;

            foreach ($room->roomDecorations()->with('decoration')->get() as $rd) {
                $total += $rd->line_total;
            }
        }

        foreach ($event->eventCaterings as $catering) {
            $total += $catering->line_total;
        }

        $event->update(['total_price' => $total]);
    }

    public static function getPrices(): array
    {
        return [
            'decoration'  => self::$decoPrices,
            'lighting'    => self::$lightPrices,
            'table_layout'=> self::$layoutPrices,
        ];
    }
}
```

---

## 7. CONTRÔLEURS API

### `app/Http/Controllers/Api/AuthController.php`
```php
<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => 'client',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json(['user' => $user, 'token' => $token], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ["Les informations d'identification sont incorrectes."],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json(['user' => $user, 'token' => $token]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnexion réussie.']);
    }

    public function user(Request $request)
    {
        return response()->json($request->user());
    }
}
```

---

### `app/Http/Controllers/Api/EventController.php`
```php
<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EventController extends Controller
{
    public function index()
    {
        $events = Auth::user()->events()->latest()->get();
        return response()->json($events);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title'       => 'required|string|max:255',
            'event_type'  => 'required|string|max:100',
            'guest_count' => 'integer|min:1',
            'budget'      => 'numeric|nullable',
        ]);

        $event = Auth::user()->events()->create([
            'title'       => $request->title,
            'event_type'  => $request->event_type,
            'guest_count' => $request->guest_count ?? 0,
            'budget'      => $request->budget,
            'status'      => 'draft',
            'total_price' => 0,
        ]);

        return response()->json($event, 201);
    }

    public function show($id)
    {
        $event = Auth::user()->events()
            ->with(['room', 'eventCaterings.cateringItem'])
            ->findOrFail($id);
        return response()->json($event);
    }

    public function update(Request $request, $id)
    {
        $event = Auth::user()->events()->findOrFail($id);

        $request->validate([
            'title'       => 'sometimes|string|max:255',
            'event_type'  => 'sometimes|string|max:100',
            'guest_count' => 'sometimes|integer|min:1',
            'budget'      => 'sometimes|numeric|nullable',
            'status'      => 'sometimes|in:draft,confirmed,cancelled',
        ]);

        $event->update($request->only(['title', 'event_type', 'guest_count', 'budget', 'status']));
        return response()->json($event);
    }

    public function destroy($id)
    {
        $event = Auth::user()->events()->findOrFail($id);
        $event->delete();
        return response()->json(['message' => 'Événement supprimé.']);
    }
}
```

---

### `app/Http/Controllers/Api/RoomController.php`
```php
<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\EventPricingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RoomController extends Controller
{
    public function show($eventId)
    {
        $event = Auth::user()->events()->findOrFail($eventId);
        $room  = $event->room;

        if (!$room) {
            return response()->json([
                'table_layout'     => null,
                'decoration_style' => null,
                'lighting_style'   => null,
                'custom_options'   => null,
            ]);
        }

        return response()->json($room);
    }

    public function store(Request $request, $eventId)
    {
        $event = Auth::user()->events()->findOrFail($eventId);

        $validated = $request->validate([
            'table_layout'     => 'nullable|string',
            'decoration_style' => 'nullable|string',
            'lighting_style'   => 'nullable|string',
            'custom_options'   => 'nullable|array',
        ]);

        $room = $event->room;
        if ($room) {
            $room->update($validated);
        } else {
            $room = $event->room()->create($validated);
        }

        EventPricingService::calculate($event->fresh());

        return response()->json($room);
    }
}
```

---

### `app/Http/Controllers/Api/CateringController.php`
```php
<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CateringItem;
use App\Services\EventPricingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CateringController extends Controller
{
    public function index()
    {
        return response()->json(CateringItem::where('active', true)->get());
    }

    public function store(Request $request, $eventId)
    {
        $event = Auth::user()->events()->findOrFail($eventId);

        $request->validate([
            'catering_item_id' => 'required|exists:catering_items,id',
            'quantity'         => 'integer|min:1',
        ]);

        $quantity     = $request->quantity ?? $event->guest_count;
        $item         = CateringItem::findOrFail($request->catering_item_id);
        $lineTotal    = $item->price_per_person * $quantity;

        $existing = $event->eventCaterings()->where('catering_item_id', $item->id)->first();
        if ($existing) {
            $existing->quantity   += $quantity;
            $existing->line_total  = $existing->quantity * $item->price_per_person;
            $existing->save();
        } else {
            $event->eventCaterings()->create([
                'catering_item_id' => $item->id,
                'quantity'         => $quantity,
                'line_total'       => $lineTotal,
            ]);
        }

        EventPricingService::calculate($event->fresh());

        return response()->json($event->fresh()->load('eventCaterings.cateringItem'));
    }

    public function update(Request $request, $eventId, $cateringItemId)
    {
        $event        = Auth::user()->events()->findOrFail($eventId);
        $ec           = $event->eventCaterings()->where('catering_item_id', $cateringItemId)->firstOrFail();
        $request->validate(['quantity' => 'required|integer|min:1']);

        $ec->quantity   = $request->quantity;
        $ec->line_total = $ec->quantity * $ec->cateringItem->price_per_person;
        $ec->save();

        EventPricingService::calculate($event->fresh());

        return response()->json($event->fresh()->load('eventCaterings.cateringItem'));
    }

    public function destroy($eventId, $cateringItemId)
    {
        $event = Auth::user()->events()->findOrFail($eventId);
        $event->eventCaterings()->where('catering_item_id', $cateringItemId)->firstOrFail()->delete();

        EventPricingService::calculate($event->fresh());

        return response()->json(['message' => 'Plat retiré.']);
    }
}
```

---

### `app/Http/Controllers/Api/DecorationController.php`
```php
<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Decoration;

class DecorationController extends Controller
{
    public function index()
    {
        return response()->json(Decoration::where('active', true)->get());
    }
}
```

---

### `app/Http/Controllers/Api/PackController.php`
```php
<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pack;
use App\Services\EventPricingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PackController extends Controller
{
    public function index()
    {
        return response()->json(Pack::with('packCaterings.cateringItem')->where('active', true)->get());
    }

    public function show($id)
    {
        return response()->json(Pack::with('packCaterings.cateringItem')->findOrFail($id));
    }

    public function apply(Request $request, $eventId)
    {
        $event = Auth::user()->events()->findOrFail($eventId);
        $request->validate(['pack_id' => 'required|exists:packs,id']);
        $pack  = Pack::with('packCaterings.cateringItem')->findOrFail($request->pack_id);

        // Appliquer les styles à la salle
        $room = $event->room ?? $event->room()->create([]);
        $room->update([
            'table_layout'     => $pack->table_layout,
            'decoration_style' => $pack->decoration_style,
            'lighting_style'   => $pack->lighting_style,
        ]);

        // Supprimer plats existants et appliquer ceux du pack
        $event->eventCaterings()->delete();
        $guestCount = max($event->guest_count, 1);

        foreach ($pack->packCaterings as $pc) {
            $quantity = (int)($guestCount * $pc->quantity_per_guest);
            $event->eventCaterings()->create([
                'catering_item_id' => $pc->catering_item_id,
                'quantity'         => $quantity,
                'line_total'       => $quantity * $pc->cateringItem->price_per_person,
            ]);
        }

        EventPricingService::calculate($event->fresh());

        return response()->json($event->fresh()->load(['room', 'eventCaterings.cateringItem']));
    }
}
```

---

### `app/Http/Controllers/Api/SuggestionController.php`
```php
<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CateringItem;
use App\Services\EventPricingService;
use Illuminate\Http\Request;

class SuggestionController extends Controller
{
    public function suggest(Request $request)
    {
        $request->validate([
            'event_type'  => 'required|string',
            'budget'      => 'required|numeric|min:1000',
            'guest_count' => 'integer|min:1',
        ]);

        $budget  = $request->budget;
        $guests  = $request->guest_count ?? 100;
        $allPlats = CateringItem::where('active', true)->get();

        if ($budget < 20000) {
            $suggestion = [
                'decoration_style' => 'zellige',
                'lighting_style'   => 'tamise',
                'table_layout'     => 'classique_rond',
                'plats'            => $this->platsByCategory($allPlats, ['entrée', 'plat'], $guests),
            ];
        } elseif ($budget < 40000) {
            $suggestion = [
                'decoration_style' => 'moderne',
                'lighting_style'   => 'spots',
                'table_layout'     => 'rectangulaire',
                'plats'            => $this->platsByCategory($allPlats, ['entrée', 'plat', 'dessert'], $guests),
            ];
        } else {
            $suggestion = [
                'decoration_style' => 'traditionnel_marocain',
                'lighting_style'   => 'lustres_traditionnels',
                'table_layout'     => 'u_shape',
                'plats'            => $this->platsByCategory($allPlats, ['entrée', 'plat', 'dessert'], $guests, true),
            ];
        }

        $prices    = EventPricingService::getPrices();
        $estimated = ($prices['decoration'][$suggestion['decoration_style']] ?? 0)
                   + ($prices['lighting'][$suggestion['lighting_style']] ?? 0)
                   + ($prices['table_layout'][$suggestion['table_layout']] ?? 0);

        foreach ($suggestion['plats'] as $plat) {
            $item = CateringItem::find($plat['id']);
            if ($item) $estimated += $item->price_per_person * $plat['quantity'];
        }

        return response()->json([
            'suggestion'      => $suggestion,
            'estimated_price' => $estimated,
        ]);
    }

    private function platsByCategory($allPlats, array $categories, int $guests, bool $luxe = false): array
    {
        $result = [];
        foreach ($categories as $cat) {
            $item = $allPlats->where('category', $cat)->first();
            if ($item) {
                $result[] = [
                    'id'       => $item->id,
                    'name'     => $item->name,
                    'quantity' => $luxe ? (int)($guests * 0.8) : $guests,
                ];
            }
        }
        return $result;
    }
}
```

---

### `app/Http/Controllers/Api/AdminController.php`
```php
<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\User;

class AdminController extends Controller
{
    public function users()
    {
        return response()->json(
            User::select('id', 'name', 'email', 'role', 'created_at')->get()
        );
    }

    public function events()
    {
        return response()->json(
            Event::with('user:id,name,email')->latest()->get()
        );
    }
}
```

---

## 8. ROUTES API

### `routes/api.php`
```php
<?php
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\CateringController;
use App\Http\Controllers\Api\DecorationController;
use App\Http\Controllers\Api\PackController;
use App\Http\Controllers\Api\SuggestionController;
use App\Http\Controllers\Api\AdminController;

// ───── Routes publiques ─────
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);
Route::post('/suggestions', [SuggestionController::class, 'suggest']); // simulation publique

// ───── Routes protégées (client connecté) ─────
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user',    [AuthController::class, 'user']);

    // Événements
    Route::apiResource('events', EventController::class);

    // Salle
    Route::get('/events/{event}/room',  [RoomController::class, 'show']);
    Route::post('/events/{event}/room', [RoomController::class, 'store']);

    // Traiteur
    Route::get('/catering', [CateringController::class, 'index']);
    Route::post('/events/{event}/catering',                      [CateringController::class, 'store']);
    Route::put('/events/{event}/catering/{cateringItem}',        [CateringController::class, 'update']);
    Route::delete('/events/{event}/catering/{cateringItem}',     [CateringController::class, 'destroy']);

    // Décorations catalogue
    Route::get('/decorations', [DecorationController::class, 'index']);

    // Packs
    Route::get('/packs',       [PackController::class, 'index']);
    Route::get('/packs/{pack}', [PackController::class, 'show']);
    Route::post('/events/{event}/apply-pack', [PackController::class, 'apply']);
});

// ───── Routes protégées admin ─────
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/users',  [AdminController::class, 'users']);
    Route::get('/events', [AdminController::class, 'events']);
});
```

---

## 9. SEEDERS

### `database/seeders/CateringItemSeeder.php`
```php
<?php
namespace Database\Seeders;

use App\Models\CateringItem;
use Illuminate\Database\Seeder;

class CateringItemSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            ['name' => 'Pastilla au poulet',             'category' => 'entrée',  'price_per_person' => 130.00, 'description' => 'Feuilleté sucré-salé traditionnel marocain'],
            ['name' => 'Couscous royal',                 'category' => 'plat',    'price_per_person' => 180.00, 'description' => 'Couscous avec merguez, agneau et légumes'],
            ['name' => 'Tajine de poulet aux olives',    'category' => 'plat',    'price_per_person' => 150.00, 'description' => 'Tajine mijoté aux olives et citron confit'],
            ['name' => 'Méchoui traditionnel',           'category' => 'plat',    'price_per_person' => 250.00, 'description' => 'Agneau entier rôti à la braise'],
            ['name' => 'Pâtisseries marocaines assorties','category' => 'dessert', 'price_per_person' => 80.00,  'description' => 'Cornes de gazelle, briouates, chebakia'],
            ['name' => 'Thé à la menthe & douceurs',     'category' => 'dessert', 'price_per_person' => 40.00,  'description' => 'Service thé traditionnel avec fruits secs'],
        ];

        foreach ($items as $item) {
            CateringItem::create($item);
        }
    }
}
```

---

### `database/seeders/PackSeeder.php`
```php
<?php
namespace Database\Seeders;

use App\Models\CateringItem;
use App\Models\Pack;
use Illuminate\Database\Seeder;

class PackSeeder extends Seeder
{
    public function run(): void
    {
        // Pack Mariage Économique
        $eco = Pack::create([
            'name'             => 'Mariage économique',
            'description'      => 'Mariage sobre et élégant : décoration zellige, tables rondes, couscous royal et pâtisseries.',
            'event_type'       => 'mariage',
            'base_price'       => 25000.00,
            'decoration_style' => 'zellige',
            'lighting_style'   => 'tamise',
            'table_layout'     => 'classique_rond',
        ]);
        $couscous    = CateringItem::where('name', 'Couscous royal')->first();
        $patisseries = CateringItem::where('name', 'Pâtisseries marocaines assorties')->first();
        if ($couscous)    $eco->packCaterings()->create(['catering_item_id' => $couscous->id,    'quantity_per_guest' => 1]);
        if ($patisseries) $eco->packCaterings()->create(['catering_item_id' => $patisseries->id, 'quantity_per_guest' => 1]);

        // Pack Mariage Luxe
        $luxe = Pack::create([
            'name'             => 'Mariage luxe',
            'description'      => 'Mariage somptueux : décoration marocaine traditionnelle, lustres fer forgé, disposition en U, traiteur complet.',
            'event_type'       => 'mariage',
            'base_price'       => 50000.00,
            'decoration_style' => 'traditionnel_marocain',
            'lighting_style'   => 'lustres_traditionnels',
            'table_layout'     => 'u_shape',
        ]);
        $tajine  = CateringItem::where('name', 'Tajine de poulet aux olives')->first();
        $pastilla= CateringItem::where('name', 'Pastilla au poulet')->first();
        $mechoui = CateringItem::where('name', 'Méchoui traditionnel')->first();
        $the     = CateringItem::where('name', 'Thé à la menthe & douceurs')->first();
        if ($tajine)  $luxe->packCaterings()->create(['catering_item_id' => $tajine->id,  'quantity_per_guest' => 0.8]);
        if ($pastilla)$luxe->packCaterings()->create(['catering_item_id' => $pastilla->id,'quantity_per_guest' => 0.5]);
        if ($mechoui) $luxe->packCaterings()->create(['catering_item_id' => $mechoui->id, 'quantity_per_guest' => 0.7]);
        if ($the)     $luxe->packCaterings()->create(['catering_item_id' => $the->id,     'quantity_per_guest' => 1]);

        // Pack Anniversaire
        Pack::create([
            'name'             => 'Anniversaire festif',
            'description'      => 'Fête d\'anniversaire colorée et moderne avec traiteur léger.',
            'event_type'       => 'anniversaire',
            'base_price'       => 15000.00,
            'decoration_style' => 'moderne',
            'lighting_style'   => 'spots',
            'table_layout'     => 'cocktail',
        ]);
    }
}
```

---

### `database/seeders/DatabaseSeeder.php`
```php
<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            CateringItemSeeder::class,
            PackSeeder::class,
        ]);
    }
}
```

---

## 10. FRONTEND — CONFIGURATION

### `frontend/vite.config.js`
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
```

---

### `frontend/index.html` (ajout police Poppins)
```html
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <title>DOMINATORES</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

---

### `frontend/src/api/axios.js`
```js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attacher le token à chaque requête
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Rediriger vers /login sur 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

### `frontend/src/config/roomOptions.js`
```js
export const DECORATION_STYLES = [
  { id: 'zellige',               label: 'Zellige traditionnel',   price: 15000, emoji: '🔷' },
  { id: 'traditionnel_marocain', label: 'Marocain classique',     price: 20000, emoji: '🏺' },
  { id: 'moderne',               label: 'Moderne épuré',          price: 12000, emoji: '✨' },
];

export const LIGHTING_STYLES = [
  { id: 'tamise',                label: 'Ambiance tamisée',       price: 2000,  emoji: '🕯️' },
  { id: 'spots',                 label: 'Spots design',           price: 3500,  emoji: '💡' },
  { id: 'lustres_traditionnels', label: 'Lustres traditionnels',  price: 5000,  emoji: '🏮' },
];

export const TABLE_LAYOUTS = [
  { id: 'classique_rond',        label: 'Tables rondes (8 pers.)',      price: 1200, emoji: '⭕' },
  { id: 'rectangulaire',         label: 'Tables rectangulaires (10 p.)',price: 1000, emoji: '▭' },
  { id: 'u_shape',               label: 'Disposition en U',             price: 2000, emoji: '∪' },
  { id: 'cocktail',              label: 'Cocktail (mange-debout)',       price: 800,  emoji: '🍸' },
];
```

---

## 11. FRONTEND — CONTEXTE ET HOOKS

### `frontend/src/context/AuthContext.jsx`
```jsx
import { createContext, useState, useEffect } from 'react';
import apiClient from '../api/axios';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await apiClient.get('/user');
          setUser(res.data);
        } catch {
          setToken(null);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await apiClient.post('/login', { email, password });
    setUser(res.data.user);
    setToken(res.data.token);
    localStorage.setItem('token', res.data.token);
  };

  const register = async (name, email, password, passwordConfirmation) => {
    const res = await apiClient.post('/register', {
      name, email, password, password_confirmation: passwordConfirmation,
    });
    setUser(res.data.user);
    setToken(res.data.token);
    localStorage.setItem('token', res.data.token);
  };

  const logout = async () => {
    await apiClient.post('/logout');
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

---

### `frontend/src/hooks/useAuth.js`
```js
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider');
  return ctx;
};
```

---

## 12. FRONTEND — PAGES AUTH

### `frontend/src/pages/Auth/Login.jsx`
```jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Login = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const { login }               = useAuth();
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.status === 422
        ? 'Email ou mot de passe incorrect.'
        : 'Une erreur est survenue.'
      );
    }
  };

  return (
    <div style={s.container}>
      <div style={s.card}>
        <h1 style={s.title}>DOMINATORES</h1>
        <p style={s.subtitle}>Connectez-vous à votre compte</p>
        {error && <p style={s.error}>{error}</p>}
        <form onSubmit={handleSubmit} style={s.form}>
          <input type="email" placeholder="Email" value={email}
            onChange={(e) => setEmail(e.target.value)} required style={s.input} />
          <input type="password" placeholder="Mot de passe" value={password}
            onChange={(e) => setPassword(e.target.value)} required style={s.input} />
          <button type="submit" style={s.button}>Se connecter</button>
        </form>
        <p style={s.linkText}>
          Pas encore de compte ? <Link to="/register" style={s.link}>Inscrivez-vous</Link>
        </p>
      </div>
    </div>
  );
};

const s = {
  container: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
    background:'linear-gradient(135deg,#fdfbf7 0%,#f4ede4 100%)', fontFamily:"'Poppins',sans-serif" },
  card: { background:'#fff', borderRadius:'20px', padding:'40px', boxShadow:'0 10px 30px rgba(0,0,0,0.05)',
    width:'100%', maxWidth:'400px', border:'1px solid #efe3d3' },
  title: { textAlign:'center', color:'#b76e4b', marginBottom:'5px', fontSize:'2rem', fontWeight:'bold' },
  subtitle: { textAlign:'center', color:'#7d8c7a', marginBottom:'25px' },
  form: { display:'flex', flexDirection:'column', gap:'15px' },
  input: { padding:'12px 15px', borderRadius:'10px', border:'1px solid #ddd2c2',
    fontSize:'1rem', outline:'none', background:'#fcf9f5' },
  button: { padding:'12px', background:'#b76e4b', color:'#fff', border:'none', borderRadius:'10px',
    fontSize:'1rem', fontWeight:'600', cursor:'pointer' },
  error: { color:'#c0392b', textAlign:'center', marginBottom:'10px' },
  linkText: { textAlign:'center', marginTop:'20px', color:'#6b5e53' },
  link: { color:'#b76e4b', textDecoration:'none', fontWeight:'600' },
};

export default Login;
```

---

### `frontend/src/pages/Auth/Register.jsx`
```jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Register = () => {
  const [form, setForm]   = useState({ name:'', email:'', password:'', confirm:'' });
  const [error, setError] = useState('');
  const { register }      = useAuth();
  const navigate          = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Les mots de passe ne correspondent pas.'); return; }
    try {
      await register(form.name, form.email, form.password, form.confirm);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.status === 422
        ? 'Erreur de validation. Vérifiez les champs.'
        : "Erreur lors de l'inscription."
      );
    }
  };

  return (
    <div style={s.container}>
      <div style={s.card}>
        <h1 style={s.title}>DOMINATORES</h1>
        <p style={s.subtitle}>Créez votre compte</p>
        {error && <p style={s.error}>{error}</p>}
        <form onSubmit={handleSubmit} style={s.form}>
          {[
            { name:'name',     type:'text',     placeholder:'Nom complet' },
            { name:'email',    type:'email',    placeholder:'Email' },
            { name:'password', type:'password', placeholder:'Mot de passe (min 8 car.)' },
            { name:'confirm',  type:'password', placeholder:'Confirmez le mot de passe' },
          ].map((f) => (
            <input key={f.name} {...f} value={form[f.name]} onChange={handleChange} required style={s.input}
              minLength={f.name.includes('pass') ? 8 : undefined} />
          ))}
          <button type="submit" style={s.button}>S'inscrire</button>
        </form>
        <p style={s.linkText}>
          Déjà un compte ? <Link to="/login" style={s.link}>Connectez-vous</Link>
        </p>
      </div>
    </div>
  );
};

const s = {
  container: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
    background:'linear-gradient(135deg,#fdfbf7 0%,#f4ede4 100%)', fontFamily:"'Poppins',sans-serif" },
  card: { background:'#fff', borderRadius:'20px', padding:'40px', boxShadow:'0 10px 30px rgba(0,0,0,0.05)',
    width:'100%', maxWidth:'400px', border:'1px solid #efe3d3' },
  title: { textAlign:'center', color:'#b76e4b', marginBottom:'5px', fontSize:'2rem', fontWeight:'bold' },
  subtitle: { textAlign:'center', color:'#7d8c7a', marginBottom:'25px' },
  form: { display:'flex', flexDirection:'column', gap:'15px' },
  input: { padding:'12px 15px', borderRadius:'10px', border:'1px solid #ddd2c2',
    fontSize:'1rem', outline:'none', background:'#fcf9f5' },
  button: { padding:'12px', background:'#b76e4b', color:'#fff', border:'none', borderRadius:'10px',
    fontSize:'1rem', fontWeight:'600', cursor:'pointer' },
  error: { color:'#c0392b', textAlign:'center', marginBottom:'10px' },
  linkText: { textAlign:'center', marginTop:'20px', color:'#6b5e53' },
  link: { color:'#b76e4b', textDecoration:'none', fontWeight:'600' },
};

export default Register;
```

---

## 13. FRONTEND — COMPOSANTS LAYOUT

### `frontend/src/components/layout/Navbar.jsx`
```jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  const handleLogout = async () => { await logout(); navigate('/'); };

  return (
    <nav style={s.nav}>
      <Link to="/" style={s.brand}>DOMINATORES</Link>
      <div style={s.links}>
        {user ? (
          <>
            <Link to="/dashboard"   style={s.link}>Mon tableau de bord</Link>
            <Link to="/suggestions" style={s.link}>Suggestions</Link>
            {user.role === 'admin' && <Link to="/admin" style={s.link}>Administration</Link>}
            <span style={s.user}>👤 {user.name}</span>
            <button onClick={handleLogout} style={s.logoutBtn}>Déconnexion</button>
          </>
        ) : (
          <>
            <Link to="/simulate" style={s.link}>Simulation</Link>
            <Link to="/login"    style={s.link}>Connexion</Link>
            <Link to="/register" style={s.registerBtn}>Créer un compte</Link>
          </>
        )}
      </div>
    </nav>
  );
};

const s = {
  nav: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'15px 40px',
    background:'#fff', borderBottom:'1px solid #efe3d3', boxShadow:'0 2px 8px rgba(0,0,0,0.03)',
    position:'sticky', top:0, zIndex:100 },
  brand: { fontSize:'1.6rem', fontWeight:'bold', color:'#b76e4b', textDecoration:'none' },
  links: { display:'flex', alignItems:'center', gap:'20px' },
  link: { textDecoration:'none', color:'#5a4a3f', fontWeight:'500', fontSize:'0.95rem' },
  user: { color:'#7d8c7a', fontSize:'0.9rem' },
  logoutBtn: { background:'none', border:'1px solid #b76e4b', borderRadius:'8px', padding:'6px 15px',
    color:'#b76e4b', cursor:'pointer', fontWeight:'500' },
  registerBtn: { background:'#b76e4b', color:'#fff', padding:'8px 16px', borderRadius:'20px',
    textDecoration:'none', fontWeight:'600', fontSize:'0.9rem' },
};

export default Navbar;
```

---

## 14. FRONTEND — DASHBOARD CLIENT

### `frontend/src/pages/Dashboard/ClientDashboard.jsx`
```jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/axios';

const STATUS_LABELS = { draft:'Brouillon', confirmed:'Confirmé', cancelled:'Annulé' };
const STATUS_COLORS = { draft:'#f0a500', confirmed:'#2e7d32', cancelled:'#c0392b' };

const ClientDashboard = () => {
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/events').then(r => setEvents(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div style={s.container}>
      <div style={s.header}>
        <h2 style={s.heading}>Mes événements</h2>
        <Link to="/events/create" style={s.createBtn}>+ Créer un événement</Link>
      </div>

      {loading ? <p>Chargement...</p> : events.length === 0 ? (
        <div style={s.empty}>
          <p>Aucun événement pour le moment.</p>
          <Link to="/events/create" style={s.createBtn}>Créer votre premier événement</Link>
        </div>
      ) : (
        <div style={s.grid}>
          {events.map((ev) => (
            <div key={ev.id} style={s.card}>
              <div style={{ ...s.statusBadge, background: STATUS_COLORS[ev.status] || '#999' }}>
                {STATUS_LABELS[ev.status] || ev.status}
              </div>
              <h3 style={s.cardTitle}>{ev.title}</h3>
              <p style={s.meta}>📅 {ev.event_type}</p>
              <p style={s.meta}>👥 {ev.guest_count} invités</p>
              <p style={s.price}>{ev.total_price} MAD</p>
              <div style={s.cardActions}>
                <Link to={`/events/${ev.id}/customize`} style={s.editBtn}>Personnaliser</Link>
                <Link to={`/events/${ev.id}/summary`}   style={s.viewBtn}>Récapitulatif</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const s = {
  container: { padding:'40px', maxWidth:'1100px', margin:'0 auto' },
  header: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px' },
  heading: { color:'#5a4a3f', margin:0 },
  createBtn: { background:'#b76e4b', color:'#fff', padding:'10px 20px', borderRadius:'10px',
    textDecoration:'none', fontWeight:'600' },
  empty: { textAlign:'center', padding:'60px', color:'#7d8c7a' },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'20px' },
  card: { background:'#fff', borderRadius:'16px', padding:'20px', boxShadow:'0 4px 12px rgba(0,0,0,0.05)',
    border:'1px solid #efe3d3', position:'relative' },
  statusBadge: { display:'inline-block', color:'#fff', fontSize:'0.75rem', fontWeight:'600',
    padding:'3px 10px', borderRadius:'20px', marginBottom:'10px' },
  cardTitle: { margin:'0 0 10px', color:'#333' },
  meta: { color:'#7d8c7a', margin:'4px 0', fontSize:'0.9rem' },
  price: { fontWeight:'bold', color:'#b76e4b', fontSize:'1.1rem', margin:'10px 0' },
  cardActions: { display:'flex', gap:'10px', marginTop:'15px' },
  editBtn: { flex:1, textAlign:'center', background:'#b76e4b', color:'#fff', padding:'8px',
    borderRadius:'8px', textDecoration:'none', fontSize:'0.9rem', fontWeight:'500' },
  viewBtn: { flex:1, textAlign:'center', background:'#f1ede6', color:'#5a4a3f', padding:'8px',
    borderRadius:'8px', textDecoration:'none', fontSize:'0.9rem', fontWeight:'500' },
};

export default ClientDashboard;
```

---

## 15. FRONTEND — DASHBOARD ADMIN

### `frontend/src/pages/Dashboard/AdminDashboard.jsx`
```jsx
import { useState, useEffect } from 'react';
import apiClient from '../../api/axios';

const AdminDashboard = () => {
  const [tab, setTab]       = useState('users');
  const [users, setUsers]   = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const url = tab === 'users' ? '/admin/users' : '/admin/events';
    apiClient.get(url)
      .then(r => tab === 'users' ? setUsers(r.data) : setEvents(r.data))
      .finally(() => setLoading(false));
  }, [tab]);

  const TabBtn = ({ id, label }) => (
    <button onClick={() => setTab(id)} style={{
      ...s.tabBtn, background: tab === id ? '#b76e4b' : '#f1ede6',
      color: tab === id ? '#fff' : '#5a4a3f',
    }}>{label}</button>
  );

  return (
    <div style={s.container}>
      <h2 style={s.heading}>Panneau d'administration</h2>
      <div style={s.tabs}>
        <TabBtn id="users"  label="👥 Utilisateurs" />
        <TabBtn id="events" label="📅 Événements"    />
      </div>

      {loading && <p>Chargement...</p>}

      {!loading && tab === 'users' && (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead><tr style={s.th}>
              <th>Nom</th><th>Email</th><th>Rôle</th><th>Inscrit le</th>
            </tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={s.tr}>
                  <td style={s.td}>{u.name}</td>
                  <td style={s.td}>{u.email}</td>
                  <td style={s.td}>
                    <span style={{ ...s.badge, background: u.role==='admin'?'#b76e4b':'#7d8c7a' }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={s.td}>{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && tab === 'events' && (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead><tr style={s.th}>
              <th>Titre</th><th>Client</th><th>Type</th><th>Statut</th><th>Prix total</th>
            </tr></thead>
            <tbody>
              {events.map(ev => (
                <tr key={ev.id} style={s.tr}>
                  <td style={s.td}>{ev.title}</td>
                  <td style={s.td}>{ev.user?.name}</td>
                  <td style={s.td}>{ev.event_type}</td>
                  <td style={s.td}>{ev.status}</td>
                  <td style={s.td}><strong>{ev.total_price} MAD</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const s = {
  container: { padding:'40px', maxWidth:'1200px', margin:'0 auto' },
  heading: { color:'#5a4a3f' },
  tabs: { display:'flex', gap:'10px', marginBottom:'25px' },
  tabBtn: { padding:'10px 20px', border:'none', borderRadius:'10px', fontWeight:'600', cursor:'pointer' },
  tableWrap: { overflowX:'auto' },
  table: { width:'100%', borderCollapse:'collapse', background:'#fff',
    borderRadius:'12px', overflow:'hidden', boxShadow:'0 2px 10px rgba(0,0,0,0.05)' },
  th: { background:'#fdf6f0', color:'#5a4a3f', textAlign:'left', padding:'12px 16px',
    borderBottom:'1px solid #efe3d3' },
  tr: { borderBottom:'1px solid #f5ede3' },
  td: { padding:'12px 16px', color:'#333' },
  badge: { color:'#fff', padding:'3px 10px', borderRadius:'20px', fontSize:'0.8rem', fontWeight:'600' },
};

export default AdminDashboard;
```

---

## 16. FRONTEND — CRÉATION D'ÉVÉNEMENT

### `frontend/src/pages/Event/CreateEvent.jsx`
```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/axios';

const EVENT_TYPES = ['mariage', 'anniversaire', 'fête', 'événement professionnel', 'autre'];

const CreateEvent = () => {
  const [form, setForm]   = useState({ title:'', event_type:'mariage', guest_count:'', budget:'' });
  const [error, setError] = useState('');
  const navigate          = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    try {
      const res = await apiClient.post('/events', {
        title:       form.title,
        event_type:  form.event_type,
        guest_count: parseInt(form.guest_count, 10) || 0,
        budget:      parseFloat(form.budget)        || null,
      });
      navigate(`/events/${res.data.id}/customize`);
    } catch { setError('Erreur lors de la création.'); }
  };

  return (
    <div style={s.container}>
      <div style={s.card}>
        <h2 style={s.heading}>Nouvel événement</h2>
        <p style={s.sub}>Renseignez les informations de base, vous pourrez personnaliser ensuite.</p>
        {error && <p style={s.error}>{error}</p>}
        <form onSubmit={handleSubmit} style={s.form}>
          <label style={s.label}>Titre de l'événement</label>
          <input name="title" placeholder="Ex: Mariage de Fatima et Amine" value={form.title}
            onChange={handleChange} required style={s.input} />

          <label style={s.label}>Type d'événement</label>
          <select name="event_type" value={form.event_type} onChange={handleChange} style={s.input}>
            {EVENT_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
          </select>

          <label style={s.label}>Nombre d'invités</label>
          <input name="guest_count" type="number" min="1" placeholder="Ex: 150"
            value={form.guest_count} onChange={handleChange} style={s.input} />

          <label style={s.label}>Budget maximum (MAD)</label>
          <input name="budget" type="number" step="100" placeholder="Ex: 50000"
            value={form.budget} onChange={handleChange} style={s.input} />

          <button type="submit" style={s.button}>Créer et personnaliser →</button>
        </form>
      </div>
    </div>
  );
};

const s = {
  container: { minHeight:'80vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#fdfbf7' },
  card: { background:'#fff', borderRadius:'20px', padding:'40px', width:'100%', maxWidth:'520px',
    boxShadow:'0 10px 30px rgba(0,0,0,0.05)', border:'1px solid #efe3d3' },
  heading: { color:'#b76e4b', margin:'0 0 5px' },
  sub: { color:'#7d8c7a', marginBottom:'25px', fontSize:'0.95rem' },
  form: { display:'flex', flexDirection:'column', gap:'12px' },
  label: { fontWeight:'500', color:'#5a4a3f', fontSize:'0.9rem', marginBottom:'-4px' },
  input: { padding:'12px 15px', borderRadius:'10px', border:'1px solid #ddd2c2',
    fontSize:'1rem', background:'#fcf9f5', outline:'none' },
  button: { padding:'13px', background:'#b76e4b', color:'#fff', border:'none', borderRadius:'10px',
    fontSize:'1rem', fontWeight:'600', cursor:'pointer', marginTop:'8px' },
  error: { color:'#c0392b', textAlign:'center' },
};

export default CreateEvent;
```

---

## 17. FRONTEND — PERSONNALISATION DE SALLE

### `frontend/src/pages/Event/CustomizeRoom.jsx`
```jsx
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../api/axios';
import { DECORATION_STYLES, LIGHTING_STYLES, TABLE_LAYOUTS } from '../../config/roomOptions';
import CateringSection from '../../components/event/CateringSection';
import PackSection from '../../components/event/PackSection';
import RoomPreview from '../../components/event/RoomPreview';

const CustomizeRoom = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [event, setEvent]       = useState(null);
  const [room, setRoom]         = useState({ table_layout:null, decoration_style:null, lighting_style:null });
  const [price, setPrice]       = useState(0);
  const [saving, setSaving]     = useState(false);
  const [activeTab, setActiveTab] = useState('room');
  const [confirming, setConfirming] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [evRes, roomRes] = await Promise.all([
        apiClient.get(`/events/${id}`),
        apiClient.get(`/events/${id}/room`),
      ]);
      setEvent(evRes.data);
      setRoom({
        table_layout:     roomRes.data.table_layout,
        decoration_style: roomRes.data.decoration_style,
        lighting_style:   roomRes.data.lighting_style,
      });
      setPrice(evRes.data.total_price || 0);
    } catch { navigate('/dashboard'); }
  }, [id, navigate]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const selectOption = async (field, value) => {
    setRoom(prev => ({ ...prev, [field]: value }));
    setSaving(true);
    try {
      await apiClient.post(`/events/${id}/room`, { [field]: value });
      const evRes = await apiClient.get(`/events/${id}`);
      setPrice(evRes.data.total_price);
    } catch { /* silent */ }
    setSaving(false);
  };

  const handleConfirm = async () => {
    if (!window.confirm('Confirmer la réservation ?')) return;
    setConfirming(true);
    try {
      await apiClient.put(`/events/${id}`, { status: 'confirmed' });
      alert('Réservation confirmée !');
      fetchAll();
    } catch { alert('Erreur lors de la confirmation.'); }
    setConfirming(false);
  };

  const renderSelector = (options, currentValue, field) => (
    <div style={s.optionGrid}>
      {options.map(opt => (
        <div key={opt.id} onClick={() => selectOption(field, opt.id)}
          style={{ ...s.optionCard,
            borderColor: currentValue === opt.id ? '#b76e4b' : '#efe3d3',
            background:  currentValue === opt.id ? '#f9f2ec' : '#fff',
          }}>
          <div style={s.optionEmoji}>{opt.emoji}</div>
          <div style={s.optionLabel}>{opt.label}</div>
          <div style={s.optionPrice}>{opt.price.toLocaleString()} MAD</div>
        </div>
      ))}
    </div>
  );

  const TABS = [
    { id:'room',     label:'🏛️ Salle'    },
    { id:'catering', label:'🍲 Traiteur'  },
    { id:'pack',     label:'📦 Packs'     },
  ];

  if (!event) return <div style={{ padding:'2rem' }}>Chargement...</div>;

  return (
    <div style={s.container}>
      <div style={s.header}>
        <div>
          <h2 style={s.title}>{event.title}</h2>
          <p style={s.subtitle}>{event.event_type} · {event.guest_count} invités</p>
        </div>
        <button onClick={() => navigate('/dashboard')} style={s.backBtn}>← Retour</button>
      </div>

      {/* Onglets */}
      <div style={s.tabs}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            ...s.tab,
            background: activeTab === t.id ? '#b76e4b' : '#f1ede6',
            color:      activeTab === t.id ? '#fff' : '#5a4a3f',
          }}>{t.label}</button>
        ))}
      </div>

      {/* Onglet Salle */}
      {activeTab === 'room' && (
        <>
          <section style={s.section}>
            <h3>Disposition des tables</h3>
            {renderSelector(TABLE_LAYOUTS, room.table_layout, 'table_layout')}
          </section>
          <section style={s.section}>
            <h3>Style de décoration</h3>
            {renderSelector(DECORATION_STYLES, room.decoration_style, 'decoration_style')}
          </section>
          <section style={s.section}>
            <h3>Éclairage</h3>
            {renderSelector(LIGHTING_STYLES, room.lighting_style, 'lighting_style')}
          </section>
          <RoomPreview layout={room.table_layout} />
        </>
      )}

      {/* Onglet Traiteur */}
      {activeTab === 'catering' && (
        <section style={s.section}>
          <h3>Sélectionnez vos plats</h3>
          <CateringSection
            eventId={id}
            guestCount={event.guest_count}
            onUpdate={() => apiClient.get(`/events/${id}`).then(r => setPrice(r.data.total_price))}
          />
        </section>
      )}

      {/* Onglet Packs */}
      {activeTab === 'pack' && (
        <section style={s.section}>
          <h3>Choisissez un pack tout inclus</h3>
          <PackSection eventId={id} onApply={fetchAll} />
        </section>
      )}

      {/* Barre de prix */}
      <div style={s.priceBar}>
        <div>
          <span style={s.priceLabel}>Prix total estimé</span>
          {saving && <span style={s.savingTxt}> · Enregistrement...</span>}
        </div>
        <strong style={s.priceVal}>{price.toLocaleString()} MAD</strong>
      </div>

      {/* Actions */}
      <div style={s.actions}>
        <button onClick={() => navigate(`/events/${id}/summary`)} style={s.summaryBtn}>
          Voir le récapitulatif
        </button>
        {event.status === 'draft' && (
          <button onClick={handleConfirm} disabled={confirming} style={s.confirmBtn}>
            {confirming ? 'Confirmation...' : '✅ Confirmer la réservation'}
          </button>
        )}
        {event.status === 'confirmed' && (
          <span style={s.confirmedBadge}>✅ Réservation confirmée</span>
        )}
      </div>
    </div>
  );
};

const s = {
  container: { padding:'30px 40px', maxWidth:'950px', margin:'0 auto', minHeight:'100vh' },
  header:    { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'20px' },
  title:     { color:'#b76e4b', margin:0, fontSize:'1.6rem' },
  subtitle:  { color:'#7d8c7a', margin:'4px 0 0', fontSize:'0.9rem' },
  backBtn:   { background:'none', border:'1px solid #ddd2c2', borderRadius:'8px', padding:'8px 16px',
    color:'#5a4a3f', cursor:'pointer', fontWeight:'500' },
  tabs:      { display:'flex', gap:'10px', marginBottom:'25px' },
  tab:       { padding:'10px 20px', border:'none', borderRadius:'10px', fontWeight:'600',
    cursor:'pointer', transition:'all 0.2s', fontSize:'0.95rem' },
  section:   { marginBottom:'30px' },
  optionGrid:{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:'15px' },
  optionCard:{ padding:'20px', borderRadius:'12px', border:'2px solid #efe3d3', cursor:'pointer',
    textAlign:'center', transition:'all 0.2s', boxShadow:'0 2px 8px rgba(0,0,0,0.03)' },
  optionEmoji:{ fontSize:'1.8rem', marginBottom:'8px' },
  optionLabel:{ fontWeight:'600', marginBottom:'6px', color:'#333' },
  optionPrice:{ color:'#b76e4b', fontWeight:'500', fontSize:'0.95rem' },
  priceBar:  { marginTop:'30px', padding:'20px 25px', background:'#fff', borderRadius:'12px',
    border:'1px solid #efe3d3', display:'flex', justifyContent:'space-between', alignItems:'center',
    boxShadow:'0 2px 10px rgba(0,0,0,0.04)' },
  priceLabel:{ color:'#5a4a3f', fontWeight:'500' },
  savingTxt: { color:'#7d8c7a', fontSize:'0.85rem' },
  priceVal:  { color:'#b76e4b', fontSize:'1.4rem' },
  actions:   { display:'flex', gap:'15px', marginTop:'20px', flexWrap:'wrap' },
  summaryBtn:{ padding:'12px 25px', background:'#f1ede6', border:'none', borderRadius:'10px',
    color:'#5a4a3f', cursor:'pointer', fontWeight:'600' },
  confirmBtn:{ padding:'12px 25px', background:'#2e7d32', color:'#fff', border:'none', borderRadius:'10px',
    cursor:'pointer', fontWeight:'600' },
  confirmedBadge:{ padding:'12px 20px', background:'#e8f5e9', borderRadius:'10px',
    color:'#2e7d32', fontWeight:'600' },
};

export default CustomizeRoom;
```

---

## 18. FRONTEND — COMPOSANTS EVENT

### `frontend/src/components/event/RoomPreview.jsx`
```jsx
const RoomPreview = ({ layout }) => {
  const renderLayout = () => {
    if (!layout) return <p style={{ color:'#7d8c7a' }}>Aucune disposition sélectionnée</p>;

    switch (layout) {
      case 'classique_rond':
        return (
          <div style={s.area}>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{ ...s.table, borderRadius:'50%', width:'65px', height:'65px' }}>
                T{i+1}
              </div>
            ))}
          </div>
        );
      case 'rectangulaire':
        return (
          <div style={s.areaCol}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ ...s.table, width:'130px', height:'38px' }}>Table {i+1}</div>
            ))}
          </div>
        );
      case 'u_shape':
        return (
          <div style={{ textAlign:'center' }}>
            <div style={{ ...s.table, width:'220px', height:'40px', margin:'0 auto 15px' }}>
              Table d'honneur
            </div>
            <div style={{ display:'flex', justifyContent:'center', gap:'12px' }}>
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {['A','B','C'].map(l => <div key={l} style={{ ...s.table, width:'80px', height:'38px' }}>{l}</div>)}
              </div>
              <div style={{ width:'60px' }}></div>
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {['D','E','F'].map(l => <div key={l} style={{ ...s.table, width:'80px', height:'38px' }}>{l}</div>)}
              </div>
            </div>
          </div>
        );
      case 'cocktail':
        return (
          <div style={s.area}>
            {[...Array(12)].map((_, i) => (
              <div key={i} style={{ ...s.table, borderRadius:'40%', width:'42px', height:'42px', fontSize:'0.7rem' }}>
                G{i+1}
              </div>
            ))}
          </div>
        );
      default:
        return <p>Disposition inconnue</p>;
    }
  };

  return (
    <div style={s.container}>
      <h3 style={s.heading}>Aperçu de la salle</h3>
      <div style={s.preview}>{renderLayout()}</div>
    </div>
  );
};

const s = {
  container: { marginTop:'20px', padding:'20px', background:'#fcf9f5', borderRadius:'12px',
    border:'1px solid #efe3d3' },
  heading:   { color:'#5a4a3f', margin:'0 0 15px' },
  preview:   { minHeight:'160px', display:'flex', alignItems:'center', justifyContent:'center', padding:'10px' },
  area:      { display:'flex', flexWrap:'wrap', justifyContent:'center', gap:'15px', alignItems:'center' },
  areaCol:   { display:'flex', flexDirection:'column', alignItems:'center', gap:'10px' },
  table:     { background:'#b76e4b', color:'#fff', display:'flex', alignItems:'center',
    justifyContent:'center', fontSize:'0.8rem', fontWeight:'bold',
    boxShadow:'0 2px 6px rgba(183,110,75,0.3)' },
};

export default RoomPreview;
```

---

### `frontend/src/components/event/CateringSection.jsx`
```jsx
import { useState, useEffect } from 'react';
import apiClient from '../../api/axios';

const CateringSection = ({ eventId, guestCount, onUpdate }) => {
  const [items, setItems]         = useState([]);
  const [selected, setSelected]   = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      apiClient.get('/catering'),
      apiClient.get(`/events/${eventId}`),
    ]).then(([catRes, evRes]) => {
      setItems(catRes.data);
      setSelected(evRes.data.event_caterings || []);
    }).finally(() => setLoading(false));
  }, [eventId]);

  const selectedIds = selected.map(i => i.catering_item_id);

  const addItem = async (itemId) => {
    try {
      const res = await apiClient.post(`/events/${eventId}/catering`, {
        catering_item_id: itemId, quantity: guestCount,
      });
      setSelected(res.data.event_caterings || []);
      onUpdate();
    } catch { /* silent */ }
  };

  const updateQty = async (itemId, qty) => {
    if (qty < 1) return;
    try {
      const res = await apiClient.put(`/events/${eventId}/catering/${itemId}`, { quantity: qty });
      setSelected(res.data.event_caterings || []);
      onUpdate();
    } catch { /* silent */ }
  };

  const removeItem = async (itemId) => {
    try {
      await apiClient.delete(`/events/${eventId}/catering/${itemId}`);
      setSelected(prev => prev.filter(i => i.catering_item_id !== itemId));
      onUpdate();
    } catch { /* silent */ }
  };

  if (loading) return <p>Chargement du catalogue...</p>;

  const CATEGORIES = ['entrée', 'plat', 'dessert'];

  return (
    <div>
      {CATEGORIES.map(cat => {
        const catItems = items.filter(i => i.category === cat);
        if (!catItems.length) return null;
        return (
          <div key={cat} style={s.catGroup}>
            <h4 style={s.catLabel}>{cat.charAt(0).toUpperCase() + cat.slice(1)}s</h4>
            <div style={s.grid}>
              {catItems.map(item => {
                const sel = selected.find(si => si.catering_item_id === item.id);
                return (
                  <div key={item.id} style={s.card}>
                    <h5 style={s.itemName}>{item.name}</h5>
                    {item.description && <p style={s.desc}>{item.description}</p>}
                    <p style={s.price}>{item.price_per_person} MAD/pers.</p>
                    {!sel ? (
                      <button onClick={() => addItem(item.id)} style={s.addBtn}>+ Ajouter</button>
                    ) : (
                      <div style={s.qtyRow}>
                        <button onClick={() => updateQty(item.id, sel.quantity - 1)} style={s.qtyBtn}>−</button>
                        <span style={s.qty}>{sel.quantity} pers.</span>
                        <button onClick={() => updateQty(item.id, sel.quantity + 1)} style={s.qtyBtn}>+</button>
                        <button onClick={() => removeItem(item.id)} style={s.removeBtn}>✕</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const s = {
  catGroup:  { marginBottom:'25px' },
  catLabel:  { color:'#5a4a3f', borderBottom:'2px solid #efe3d3', paddingBottom:'5px', marginBottom:'12px' },
  grid:      { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(230px,1fr))', gap:'15px' },
  card:      { background:'#fff', borderRadius:'12px', padding:'15px', border:'1px solid #efe3d3',
    boxShadow:'0 2px 8px rgba(0,0,0,0.03)' },
  itemName:  { margin:'0 0 6px', color:'#333', fontSize:'1rem' },
  desc:      { color:'#7d8c7a', fontSize:'0.85rem', margin:'0 0 8px' },
  price:     { fontWeight:'bold', color:'#b76e4b', margin:'0 0 10px' },
  addBtn:    { background:'#b76e4b', color:'#fff', border:'none', borderRadius:'8px',
    padding:'6px 14px', cursor:'pointer', fontWeight:'500' },
  qtyRow:    { display:'flex', alignItems:'center', gap:'8px' },
  qtyBtn:    { background:'#f1ede6', border:'1px solid #ddd2c2', borderRadius:'6px',
    width:'28px', height:'28px', cursor:'pointer', fontWeight:'bold' },
  qty:       { fontWeight:'600', color:'#333' },
  removeBtn: { marginLeft:'auto', background:'none', border:'none', color:'#c0392b',
    cursor:'pointer', fontSize:'1rem', fontWeight:'bold' },
};

export default CateringSection;
```

---

### `frontend/src/components/event/PackSection.jsx`
```jsx
import { useState, useEffect } from 'react';
import apiClient from '../../api/axios';

const PackSection = ({ eventId, onApply }) => {
  const [packs, setPacks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);

  useEffect(() => {
    apiClient.get('/packs').then(r => setPacks(r.data)).finally(() => setLoading(false));
  }, []);

  const applyPack = async (packId) => {
    if (!window.confirm('Appliquer ce pack ? La configuration actuelle sera remplacée.')) return;
    setApplying(packId);
    try {
      await apiClient.post(`/events/${eventId}/apply-pack`, { pack_id: packId });
      onApply();
    } catch { alert('Erreur lors de l\'application du pack.'); }
    setApplying(null);
  };

  if (loading) return <p>Chargement des packs...</p>;

  return (
    <div style={s.grid}>
      {packs.map(pack => (
        <div key={pack.id} style={s.card}>
          <h3 style={s.packName}>{pack.name}</h3>
          <p style={s.type}>📅 {pack.event_type}</p>
          <p style={s.desc}>{pack.description}</p>
          <div style={s.details}>
            <span>🔷 {pack.decoration_style}</span>
            <span>💡 {pack.lighting_style}</span>
            <span>🪑 {pack.table_layout}</span>
          </div>
          {pack.pack_caterings?.length > 0 && (
            <p style={s.platsLabel}>Traiteur inclus : {pack.pack_caterings.map(pc => pc.catering_item?.name).join(', ')}</p>
          )}
          <p style={s.price}>À partir de {pack.base_price?.toLocaleString()} MAD</p>
          <button onClick={() => applyPack(pack.id)} disabled={applying === pack.id} style={s.applyBtn}>
            {applying === pack.id ? 'Application...' : '→ Appliquer ce pack'}
          </button>
        </div>
      ))}
    </div>
  );
};

const s = {
  grid:      { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'20px' },
  card:      { background:'#fff', borderRadius:'16px', padding:'22px', border:'1px solid #efe3d3',
    boxShadow:'0 4px 12px rgba(0,0,0,0.04)' },
  packName:  { color:'#b76e4b', margin:'0 0 4px', fontSize:'1.1rem' },
  type:      { color:'#7d8c7a', fontSize:'0.85rem', margin:'0 0 8px' },
  desc:      { color:'#5a4a3f', fontSize:'0.9rem', margin:'0 0 12px', lineHeight:'1.4' },
  details:   { display:'flex', flexWrap:'wrap', gap:'8px', marginBottom:'10px', fontSize:'0.85rem', color:'#7d8c7a' },
  platsLabel:{ fontSize:'0.85rem', color:'#5a4a3f', margin:'0 0 10px', fontStyle:'italic' },
  price:     { fontWeight:'bold', color:'#b76e4b', fontSize:'1.1rem', margin:'0 0 12px' },
  applyBtn:  { width:'100%', padding:'10px', background:'#5a4a3f', color:'#fff', border:'none',
    borderRadius:'8px', cursor:'pointer', fontWeight:'600', fontSize:'0.95rem' },
};

export default PackSection;
```

---

## 19. FRONTEND — SUGGESTIONS & SIMULATION

### `frontend/src/pages/Suggestions.jsx`
```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';

const EVENT_TYPES = ['mariage', 'anniversaire', 'fête', 'événement professionnel'];

const Suggestions = () => {
  const navigate = useNavigate();
  const [form, setForm]   = useState({ event_type:'mariage', budget:'', guest_count:'' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const res = await apiClient.post('/suggestions', {
        event_type:  form.event_type,
        budget:      parseFloat(form.budget),
        guest_count: parseInt(form.guest_count, 10) || 100,
      });
      setResult(res.data);
    } catch { setError('Impossible de générer une suggestion.'); }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!result) return;
    try {
      const evRes = await apiClient.post('/events', {
        title:       `Événement suggéré – ${form.event_type}`,
        event_type:  form.event_type,
        guest_count: parseInt(form.guest_count, 10) || 100,
        budget:      parseFloat(form.budget),
      });
      const eid = evRes.data.id;
      await apiClient.post(`/events/${eid}/room`, {
        decoration_style: result.suggestion.decoration_style,
        lighting_style:   result.suggestion.lighting_style,
        table_layout:     result.suggestion.table_layout,
      });
      for (const p of result.suggestion.plats) {
        if (p.id) await apiClient.post(`/events/${eid}/catering`, { catering_item_id: p.id, quantity: p.quantity });
      }
      navigate(`/events/${eid}/customize`);
    } catch { setError("Erreur lors de la création de l'événement."); }
  };

  return (
    <div style={s.container}>
      <div style={s.card}>
        <h2 style={s.heading}>💡 Suggestion personnalisée</h2>
        <p style={s.sub}>Entrez votre budget et nous configurons l'événement idéal pour vous.</p>
        <form onSubmit={handleSubmit} style={s.form}>
          <select name="event_type" value={form.event_type} onChange={handleChange} style={s.input}>
            {EVENT_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
          </select>
          <input name="budget" type="number" placeholder="Budget total (MAD)"
            value={form.budget} onChange={handleChange} required style={s.input} />
          <input name="guest_count" type="number" placeholder="Nombre d'invités"
            value={form.guest_count} onChange={handleChange} style={s.input} />
          <button type="submit" disabled={loading} style={s.btn}>
            {loading ? 'Analyse en cours...' : '✨ Obtenir une suggestion'}
          </button>
        </form>
        {error && <p style={s.error}>{error}</p>}

        {result && (
          <div style={s.result}>
            <h3 style={{ color:'#b76e4b' }}>Notre recommandation</h3>
            <div style={s.row}><span>🔷 Décoration :</span> <strong>{result.suggestion.decoration_style}</strong></div>
            <div style={s.row}><span>💡 Éclairage :</span>  <strong>{result.suggestion.lighting_style}</strong></div>
            <div style={s.row}><span>🪑 Disposition :</span> <strong>{result.suggestion.table_layout}</strong></div>
            {result.suggestion.plats?.length > 0 && (
              <div style={s.row}><span>🍲 Plats :</span> <strong>{result.suggestion.plats.map(p => p.name || `ID ${p.id}`).join(', ')}</strong></div>
            )}
            <p style={s.price}>Prix estimé : {result.estimated_price?.toLocaleString()} MAD</p>
            <button onClick={handleCreate} style={s.createBtn}>
              → Créer cet événement
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const s = {
  container: { minHeight:'80vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' },
  card:      { background:'#fff', borderRadius:'20px', padding:'40px', width:'100%', maxWidth:'550px',
    boxShadow:'0 10px 30px rgba(0,0,0,0.05)', border:'1px solid #efe3d3' },
  heading:   { color:'#b76e4b', margin:'0 0 5px' },
  sub:       { color:'#7d8c7a', marginBottom:'25px', fontSize:'0.95rem' },
  form:      { display:'flex', flexDirection:'column', gap:'12px' },
  input:     { padding:'12px 15px', borderRadius:'10px', border:'1px solid #ddd2c2',
    fontSize:'1rem', background:'#fcf9f5' },
  btn:       { padding:'13px', background:'#b76e4b', color:'#fff', border:'none', borderRadius:'10px',
    fontSize:'1rem', fontWeight:'600', cursor:'pointer' },
  error:     { color:'#c0392b', marginTop:'10px', textAlign:'center' },
  result:    { marginTop:'25px', padding:'20px', background:'#f9f2ec', borderRadius:'14px',
    border:'1px solid #efe3d3' },
  row:       { display:'flex', gap:'8px', marginBottom:'8px', fontSize:'0.95rem', alignItems:'center' },
  price:     { fontWeight:'bold', color:'#b76e4b', fontSize:'1.2rem', margin:'12px 0' },
  createBtn: { width:'100%', padding:'12px', background:'#5a4a3f', color:'#fff', border:'none',
    borderRadius:'10px', cursor:'pointer', fontWeight:'600' },
};

export default Suggestions;
```

---

### `frontend/src/pages/Simulate.jsx`
```jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axios';

const Simulate = () => {
  const [form, setForm]     = useState({ event_type:'mariage', budget:'', guest_count:'' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await apiClient.post('/suggestions', {
        event_type:  form.event_type,
        budget:      parseFloat(form.budget),
        guest_count: parseInt(form.guest_count, 10) || 100,
      });
      setResult(res.data);
    } catch { alert('Erreur de simulation.'); }
    setLoading(false);
  };

  return (
    <div style={s.container}>
      <div style={s.card}>
        <h2 style={s.heading}>🎉 Simulation gratuite</h2>
        <p style={s.sub}>Découvrez ce que vous pourriez obtenir sans créer de compte.</p>
        <form onSubmit={handleSubmit} style={s.form}>
          <select value={form.event_type} onChange={e => setForm({...form, event_type:e.target.value})} style={s.input}>
            {['mariage','anniversaire','fête','événement professionnel'].map(t =>
              <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
          </select>
          <input type="number" placeholder="Budget (MAD)" value={form.budget}
            onChange={e => setForm({...form, budget:e.target.value})} required style={s.input} />
          <input type="number" placeholder="Nombre d'invités" value={form.guest_count}
            onChange={e => setForm({...form, guest_count:e.target.value})} style={s.input} />
          <button type="submit" disabled={loading} style={s.btn}>
            {loading ? 'Simulation...' : 'Simuler mon événement'}
          </button>
        </form>

        {result && (
          <div style={s.result}>
            <h3 style={{ color:'#b76e4b' }}>Résultat</h3>
            <p>Décoration : <strong>{result.suggestion.decoration_style}</strong></p>
            <p>Éclairage : <strong>{result.suggestion.lighting_style}</strong></p>
            <p>Prix estimé : <strong style={{ color:'#b76e4b' }}>{result.estimated_price?.toLocaleString()} MAD</strong></p>
            <p style={{ marginTop:'15px', color:'#5a4a3f' }}>
              Pour personnaliser et réserver,{' '}
              <Link to="/register" style={{ color:'#b76e4b', fontWeight:'600' }}>créez un compte</Link> ou{' '}
              <Link to="/login" style={{ color:'#b76e4b', fontWeight:'600' }}>connectez-vous</Link>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const s = {
  container: { minHeight:'80vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' },
  card:      { background:'#fff', borderRadius:'20px', padding:'40px', width:'100%', maxWidth:'500px',
    boxShadow:'0 10px 30px rgba(0,0,0,0.05)', border:'1px solid #efe3d3' },
  heading:   { color:'#b76e4b', margin:'0 0 5px' },
  sub:       { color:'#7d8c7a', marginBottom:'25px', fontSize:'0.95rem' },
  form:      { display:'flex', flexDirection:'column', gap:'12px' },
  input:     { padding:'12px 15px', borderRadius:'10px', border:'1px solid #ddd2c2',
    fontSize:'1rem', background:'#fcf9f5' },
  btn:       { padding:'13px', background:'#b76e4b', color:'#fff', border:'none', borderRadius:'10px',
    fontSize:'1rem', fontWeight:'600', cursor:'pointer' },
  result:    { marginTop:'25px', padding:'20px', background:'#f9f2ec', borderRadius:'12px',
    border:'1px solid #efe3d3' },
};

export default Simulate;
```

---

## 20. FRONTEND — RÉCAPITULATIF & CONFIRMATION

### `frontend/src/pages/Event/EventSummary.jsx`
```jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../api/axios';

const DECO_LABELS = { zellige:'Zellige traditionnel', traditionnel_marocain:'Marocain classique', moderne:'Moderne épuré' };
const LIGHT_LABELS = { tamise:'Ambiance tamisée', spots:'Spots design', lustres_traditionnels:'Lustres traditionnels' };
const LAYOUT_LABELS = { classique_rond:'Tables rondes', rectangulaire:'Tables rectangulaires', u_shape:'Disposition en U', cocktail:'Cocktail' };

const EventSummary = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent]     = useState(null);
  const [room, setRoom]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    Promise.all([
      apiClient.get(`/events/${id}`),
      apiClient.get(`/events/${id}/room`),
    ]).then(([evRes, roomRes]) => {
      setEvent(evRes.data);
      setRoom(roomRes.data);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleConfirm = async () => {
    if (!window.confirm('Confirmer la réservation ? Cette action est définitive.')) return;
    setConfirming(true);
    try {
      await apiClient.put(`/events/${id}`, { status: 'confirmed' });
      alert('✅ Réservation confirmée !');
      navigate('/dashboard');
    } catch { alert('Erreur'); }
    setConfirming(false);
  };

  if (loading || !event) return <div style={{ padding:'2rem' }}>Chargement...</div>;

  const caterings = event.event_caterings || [];

  return (
    <div style={s.container}>
      <div style={s.header}>
        <h2 style={s.title}>📋 Récapitulatif</h2>
        <button onClick={() => navigate(`/events/${id}/customize`)} style={s.backBtn}>← Modifier</button>
      </div>

      <div style={s.card}>
        <h3 style={s.sectionTitle}>Informations générales</h3>
        <Row label="Événement"    value={event.title} />
        <Row label="Type"         value={event.event_type} />
        <Row label="Invités"      value={`${event.guest_count} personnes`} />
        <Row label="Budget max"   value={event.budget ? `${event.budget.toLocaleString()} MAD` : 'Non défini'} />
        <Row label="Statut"       value={event.status === 'draft' ? '⏳ Brouillon' : '✅ Confirmé'} />
      </div>

      {room && (room.decoration_style || room.lighting_style || room.table_layout) && (
        <div style={s.card}>
          <h3 style={s.sectionTitle}>Configuration de la salle</h3>
          {room.decoration_style && <Row label="Décoration" value={DECO_LABELS[room.decoration_style] || room.decoration_style} />}
          {room.lighting_style   && <Row label="Éclairage"  value={LIGHT_LABELS[room.lighting_style]   || room.lighting_style}   />}
          {room.table_layout     && <Row label="Disposition" value={LAYOUT_LABELS[room.table_layout]    || room.table_layout}     />}
        </div>
      )}

      {caterings.length > 0 && (
        <div style={s.card}>
          <h3 style={s.sectionTitle}>Traiteur</h3>
          {caterings.map(ec => (
            <div key={ec.id} style={s.cateringRow}>
              <span>{ec.catering_item?.name}</span>
              <span style={{ color:'#7d8c7a' }}>{ec.quantity} pers.</span>
              <span style={{ fontWeight:'600', color:'#b76e4b' }}>{ec.line_total?.toLocaleString()} MAD</span>
            </div>
          ))}
        </div>
      )}

      <div style={s.totalCard}>
        <span style={s.totalLabel}>Total estimé</span>
        <strong style={s.totalValue}>{event.total_price?.toLocaleString()} MAD</strong>
      </div>

      <div style={s.actions}>
        {event.status === 'draft' && (
          <button onClick={handleConfirm} disabled={confirming} style={s.confirmBtn}>
            {confirming ? 'Confirmation...' : '✅ Confirmer la réservation'}
          </button>
        )}
        {event.status === 'confirmed' && (
          <div style={s.confirmedBox}>✅ Réservation confirmée — Merci !</div>
        )}
        <button onClick={() => navigate('/dashboard')} style={s.dashBtn}>Retour au tableau de bord</button>
      </div>
    </div>
  );
};

const Row = ({ label, value }) => (
  <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #f5ede3' }}>
    <span style={{ color:'#7d8c7a' }}>{label}</span>
    <span style={{ fontWeight:'500', color:'#333' }}>{value}</span>
  </div>
);

const s = {
  container: { padding:'30px 40px', maxWidth:'750px', margin:'0 auto', minHeight:'100vh' },
  header:    { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'25px' },
  title:     { color:'#b76e4b', margin:0 },
  backBtn:   { background:'none', border:'1px solid #ddd2c2', borderRadius:'8px', padding:'8px 16px',
    color:'#5a4a3f', cursor:'pointer' },
  card:      { background:'#fff', borderRadius:'12px', padding:'20px', marginBottom:'20px',
    border:'1px solid #efe3d3', boxShadow:'0 2px 8px rgba(0,0,0,0.03)' },
  sectionTitle:{ color:'#5a4a3f', margin:'0 0 12px', fontSize:'1rem' },
  cateringRow: { display:'flex', justifyContent:'space-between', padding:'8px 0',
    borderBottom:'1px solid #f5ede3', fontSize:'0.95rem' },
  totalCard: { background:'#b76e4b', borderRadius:'12px', padding:'20px 25px', marginBottom:'20px',
    display:'flex', justifyContent:'space-between', alignItems:'center' },
  totalLabel:{ color:'rgba(255,255,255,0.85)', fontSize:'1rem' },
  totalValue:{ color:'#fff', fontSize:'1.6rem' },
  actions:   { display:'flex', flexDirection:'column', gap:'12px' },
  confirmBtn:{ padding:'14px', background:'#2e7d32', color:'#fff', border:'none', borderRadius:'10px',
    cursor:'pointer', fontWeight:'600', fontSize:'1rem' },
  confirmedBox:{ padding:'14px', background:'#e8f5e9', borderRadius:'10px', color:'#2e7d32',
    fontWeight:'600', textAlign:'center' },
  dashBtn:   { padding:'12px', background:'#f1ede6', border:'none', borderRadius:'10px',
    color:'#5a4a3f', cursor:'pointer', fontWeight:'500' },
};

export default EventSummary;
```

---

## 21. FRONTEND — PAGE D'ACCUEIL

### `frontend/src/pages/Home.jsx`
```jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const FEATURES = [
  { emoji:'🏛️', title:'Salle interactive', desc:'Disposition des tables, décoration marocaine, éclairage : visualisez en direct votre espace.' },
  { emoji:'🍲', title:'Traiteur marocain', desc:'Couscous, tajines, pastilla, pâtisseries : ajoutez les plats et le prix s\'ajuste automatiquement.' },
  { emoji:'💰', title:'Budget intelligent', desc:'Notre système vous suggère la meilleure configuration selon votre budget, en temps réel.' },
  { emoji:'📦', title:'Packs tout inclus', desc:'Mariage économique, luxe, anniversaire… choisissez un pack complet en un clic.' },
];

const Home = () => {
  const { user } = useAuth();

  return (
    <div style={s.page}>
      {/* Hero */}
      <div style={s.hero}>
        <h1 style={s.title}>DOMINATORES</h1>
        <p style={s.tagline}>La première plateforme marocaine de création d'événements sur mesure.</p>
        <p style={s.subtitle}>
          Personnalisez votre salle, choisissez votre traiteur,<br />
          simulez votre budget — le tout en quelques clics.
        </p>
        <div style={s.actions}>
          {user ? (
            <>
              <Link to="/dashboard"   style={s.primaryBtn}>Mon tableau de bord</Link>
              <Link to="/suggestions" style={s.secondaryBtn}>Suggestions intelligentes</Link>
            </>
          ) : (
            <>
              <Link to="/simulate"  style={s.primaryBtn}>Essayer la simulation</Link>
              <Link to="/register"  style={s.secondaryBtn}>Créer un compte gratuit</Link>
            </>
          )}
        </div>
      </div>

      {/* Features */}
      <div style={s.features}>
        {FEATURES.map((f) => (
          <div key={f.title} style={s.featureCard}>
            <div style={s.featureEmoji}>{f.emoji}</div>
            <h3 style={s.featureTitle}>{f.title}</h3>
            <p style={s.featureDesc}>{f.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA bas */}
      {!user && (
        <div style={s.cta}>
          <h2 style={s.ctaTitle}>Prêt à organiser votre événement ?</h2>
          <Link to="/register" style={s.primaryBtn}>Commencer maintenant →</Link>
        </div>
      )}
    </div>
  );
};

const s = {
  page:     { background:'transparent' },
  hero:     { minHeight:'85vh', display:'flex', flexDirection:'column', justifyContent:'center',
    alignItems:'center', textAlign:'center', padding:'60px 20px 40px' },
  title:    { fontSize:'clamp(2.5rem,6vw,4rem)', color:'#b76e4b', marginBottom:'10px', fontWeight:'700',
    letterSpacing:'-0.5px' },
  tagline:  { fontSize:'clamp(1rem,2.5vw,1.3rem)', color:'#5a4a3f', marginBottom:'12px', fontWeight:'500' },
  subtitle: { fontSize:'1rem', color:'#7d8c7a', lineHeight:'1.6', marginBottom:'35px', maxWidth:'500px' },
  actions:  { display:'flex', gap:'15px', flexWrap:'wrap', justifyContent:'center' },
  primaryBtn:  { background:'#b76e4b', color:'#fff', padding:'14px 30px', borderRadius:'30px',
    textDecoration:'none', fontWeight:'600', fontSize:'1rem', boxShadow:'0 4px 15px rgba(183,110,75,0.3)' },
  secondaryBtn:{ background:'#fff', color:'#b76e4b', border:'2px solid #b76e4b', padding:'14px 30px',
    borderRadius:'30px', textDecoration:'none', fontWeight:'600', fontSize:'1rem' },
  features: { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))', gap:'25px',
    maxWidth:'1000px', margin:'0 auto 60px', padding:'0 20px' },
  featureCard: { background:'#fff', borderRadius:'18px', padding:'28px', boxShadow:'0 4px 15px rgba(0,0,0,0.05)',
    border:'1px solid #efe3d3', textAlign:'center' },
  featureEmoji:{ fontSize:'2.2rem', marginBottom:'12px' },
  featureTitle:{ color:'#5a4a3f', margin:'0 0 10px', fontSize:'1.05rem' },
  featureDesc: { color:'#7d8c7a', fontSize:'0.9rem', lineHeight:'1.5', margin:0 },
  cta:      { textAlign:'center', padding:'40px 20px 80px' },
  ctaTitle: { color:'#5a4a3f', marginBottom:'20px', fontSize:'1.5rem' },
};

export default Home;
```

---

## 22. FRONTEND — APP.JSX & ROUTAGE

### `frontend/src/App.jsx`
```jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';

import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Simulate from './pages/Simulate';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ClientDashboard from './pages/Dashboard/ClientDashboard';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import CreateEvent from './pages/Event/CreateEvent';
import CustomizeRoom from './pages/Event/CustomizeRoom';
import EventSummary from './pages/Event/EventSummary';
import Suggestions from './pages/Suggestions';

// Composant de protection des routes
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding:'2rem', textAlign:'center' }}>Chargement...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => (
  <>
    <Navbar />
    <Routes>
      {/* Publiques */}
      <Route path="/"          element={<Home />} />
      <Route path="/simulate"  element={<Simulate />} />
      <Route path="/login"     element={<Login />} />
      <Route path="/register"  element={<Register />} />

      {/* Protégées — client */}
      <Route path="/dashboard" element={<ProtectedRoute><ClientDashboard /></ProtectedRoute>} />
      <Route path="/suggestions" element={<ProtectedRoute><Suggestions /></ProtectedRoute>} />
      <Route path="/events/create" element={<ProtectedRoute><CreateEvent /></ProtectedRoute>} />
      <Route path="/events/:id/customize" element={<ProtectedRoute><CustomizeRoom /></ProtectedRoute>} />
      <Route path="/events/:id/summary"   element={<ProtectedRoute><EventSummary /></ProtectedRoute>} />

      {/* Protégées — admin */}
      <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </>
);

const App = () => (
  <AuthProvider>
    <Router>
      <AppRoutes />
    </Router>
  </AuthProvider>
);

export default App;
```

---

### `frontend/src/main.jsx`
```jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

---

## 23. STYLES GLOBAUX

### `frontend/src/styles/index.css`
```css
/* ── Reset & Base ──────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; }

body {
  margin: 0;
  padding: 0;
  font-family: 'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #fdfbf7;
  color: #333;
  -webkit-font-smoothing: antialiased;
}

/* ── Motif zellige subtil en fond ──────────────────────── */
body::before {
  content: "";
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23b76e4b' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  pointer-events: none;
  z-index: -1;
}

/* ── Typographie ───────────────────────────────────────── */
h1, h2, h3, h4, h5 { margin: 0 0 0.5em; }
p { margin: 0 0 0.5em; line-height: 1.6; }
a { text-decoration: none; }

/* ── Inputs focus ──────────────────────────────────────── */
input:focus, select:focus, textarea:focus {
  border-color: #b76e4b !important;
  box-shadow: 0 0 0 3px rgba(183, 110, 75, 0.12);
  outline: none;
}

/* ── Boutons hover ─────────────────────────────────────── */
button:hover { opacity: 0.88; }

/* ── Scrollbar ─────────────────────────────────────────── */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #fdfbf7; }
::-webkit-scrollbar-thumb { background: #ddd2c2; border-radius: 3px; }
```

---

## 24. COMMANDES D'INSTALLATION

### Backend (dans le dossier `backend/`)
```bash
# 1. Créer le projet Laravel
composer create-project laravel/laravel backend
cd backend

# 2. Créer le fichier SQLite vide
touch database/database.sqlite

# 3. Configurer .env (voir section .env ci-dessus)

# 4. Installer Sanctum
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"

# 5. Générer les migrations (puis copier les codes des migrations)
php artisan make:migration create_events_table
php artisan make:migration create_rooms_table
php artisan make:migration create_catering_items_table
php artisan make:migration create_event_catering_table
php artisan make:migration create_packs_table
php artisan make:migration create_pack_catering_table
php artisan make:migration create_decorations_table
php artisan make:migration create_room_decorations_table

# 6. Générer les modèles
php artisan make:model Event
php artisan make:model Room
php artisan make:model CateringItem
php artisan make:model EventCatering
php artisan make:model Pack
php artisan make:model PackCatering
php artisan make:model Decoration
php artisan make:model RoomDecoration

# 7. Générer les contrôleurs
php artisan make:controller Api/AuthController
php artisan make:controller Api/EventController
php artisan make:controller Api/RoomController
php artisan make:controller Api/CateringController
php artisan make:controller Api/DecorationController
php artisan make:controller Api/PackController
php artisan make:controller Api/SuggestionController
php artisan make:controller Api/AdminController

# 8. Créer le middleware admin
php artisan make:middleware AdminMiddleware

# 9. Créer le service (dossier Services à créer manuellement)
mkdir -p app/Services

# 10. Créer les seeders
php artisan make:seeder CateringItemSeeder
php artisan make:seeder PackSeeder

# 11. Lancer les migrations et seeders
php artisan migrate
php artisan db:seed

# 12. Créer un compte admin (via tinker)
php artisan tinker
# >>> \App\Models\User::create(['name'=>'Admin','email'=>'admin@dominatores.ma','password'=>bcrypt('password123'),'role'=>'admin'])

# 13. Lancer le serveur
php artisan serve
```

---

### Frontend (dans le dossier `frontend/`)
```bash
# 1. Créer le projet Vite + React
npm create vite@latest frontend -- --template react
cd frontend

# 2. Installer les dépendances
npm install
npm install axios react-router-dom

# 3. Créer la structure de dossiers
mkdir -p src/api src/components/layout src/components/event src/components/common
mkdir -p src/config src/context src/hooks src/pages/Auth src/pages/Dashboard src/pages/Event src/styles

# 4. Copier tous les fichiers de code (voir sections ci-dessus)

# 5. Lancer le serveur de développement
npm run dev
# → Ouvrir http://localhost:5173
```

---

### Enregistrement du middleware dans `app/Http/Kernel.php`
```php
// Dans le tableau $routeMiddleware :
'admin' => \App\Http\Middleware\AdminMiddleware::class,
```

---

### Configuration CORS (`config/cors.php`)
```php
// S'assurer que ces valeurs sont présentes :
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_methods' => ['*'],
'allowed_origins' => ['http://localhost:5173'],
'allowed_headers' => ['*'],
'supports_credentials' => false,
```

---

## PALETTE DE COULEURS & DESIGN TOKENS

| Nom                 | Valeur      | Usage                          |
|---------------------|-------------|--------------------------------|
| Terracotta principal| `#b76e4b`   | Boutons, accents, titres       |
| Brun foncé          | `#5a4a3f`   | Texte secondaire, nav          |
| Vert zellige        | `#7d8c7a`   | Sous-titres, métadonnées       |
| Fond beige clair    | `#fdfbf7`   | Arrière-plan global            |
| Fond carte          | `#ffffff`   | Cards, formulaires             |
| Bordure subtile     | `#efe3d3`   | Séparateurs, bordures cards    |
| Input bg            | `#fcf9f5`   | Arrière-plan des inputs        |
| Vert confirmation   | `#2e7d32`   | Statut confirmé, validation    |
| Rouge erreur        | `#c0392b`   | Messages d'erreur              |

---

## FLUX UTILISATEUR (RÉSUMÉ)

```
/ (Home)
  ├── /simulate          → Simulation sans compte
  ├── /register          → Inscription → /dashboard
  └── /login             → Connexion  → /dashboard

/dashboard (Client)
  ├── /events/create     → Création événement → /events/:id/customize
  └── /suggestions       → Suggestion intelligente → /events/:id/customize

/events/:id/customize
  ├── Onglet Salle       → Choisir disposition, décoration, éclairage
  ├── Onglet Traiteur    → Ajouter/modifier/supprimer des plats
  └── Onglet Packs       → Appliquer un pack tout inclus
  └── → /events/:id/summary

/events/:id/summary      → Récapitulatif complet + Confirmer

/admin                   → Onglets Utilisateurs / Événements
```

---

*Document généré pour le projet PIE — Module DOMINATORES — Stack: Laravel + React + SQLite*
