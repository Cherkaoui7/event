$ErrorActionPreference = "Continue"

cd c:\Users\USER\Documents\event

Write-Host "Renaming existing folders..."
Rename-Item -Path "backend" -NewName "backend_custom" -Force
Rename-Item -Path "frontend" -NewName "frontend_custom" -Force

Write-Host "Creating Laravel project..."
composer create-project laravel/laravel:^10.0 backend --no-interaction

Write-Host "Creating Vite React project..."
npx -y create-vite@latest frontend --template react

Write-Host "Copying custom files..."
xcopy /E /Y /H /R backend_custom\* backend\
xcopy /E /Y /H /R frontend_custom\* frontend\

Write-Host "Setting up Backend..."
cd backend
composer require laravel/sanctum --no-interaction
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"

Write-Host "Configuring .env..."
$envPath = ".env"
$envContent = Get-Content $envPath
$dbPath = "$((Get-Item .).FullName)\database\database.sqlite".Replace('\', '\\')
$envContent = $envContent -replace '^DB_CONNECTION=.*', 'DB_CONNECTION=sqlite'
$envContent = $envContent -replace '^DB_DATABASE=.*', ""
$envContent += "DB_DATABASE=$dbPath"
$envContent += "SANCTUM_STATEFUL_DOMAINS=localhost:5173"
$envContent += "SESSION_DOMAIN=localhost"
$envContent | Set-Content $envPath

Write-Host "Updating Kernel.php..."
$kernelPath = "app\Http\Kernel.php"
if (Test-Path $kernelPath) {
    $kernelContent = Get-Content $kernelPath -Raw
    $kernelContent = $kernelContent -replace "protected `$middlewareAliases = \[", "protected `$middlewareAliases = [`n        'admin' => \App\Http\Middleware\AdminMiddleware::class,"
    Set-Content -Path $kernelPath -Value $kernelContent
}

Write-Host "Updating cors.php..."
$corsPath = "config\cors.php"
if (Test-Path $corsPath) {
    $corsContent = Get-Content $corsPath -Raw
    $corsContent = $corsContent -replace "'paths' => \[.*?\]", "'paths' => ['api/*', 'sanctum/csrf-cookie']"
    $corsContent = $corsContent -replace "'allowed_origins' => \[.*?\]", "'allowed_origins' => ['http://localhost:5173']"
    Set-Content -Path $corsPath -Value $corsContent
}

Write-Host "Running migrations and seeds..."
php artisan migrate --force
php artisan db:seed --force

Write-Host "Creating admin user..."
php artisan tinker --execute="\App\Models\User::create(['name'=>'Admin','email'=>'admin@dominatores.ma','password'=>bcrypt('password123'),'role'=>'admin']);"

Write-Host "Setting up Frontend..."
cd ..\frontend
npm install
npm install axios react-router-dom

cd ..
Write-Host "Cleaning up custom directories..."
Remove-Item -Path "backend_custom" -Recurse -Force
Remove-Item -Path "frontend_custom" -Recurse -Force

Write-Host "Setup Complete!"
