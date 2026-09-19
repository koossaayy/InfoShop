<!DOCTYPE html>
<html>
<head>
    <title>{{ __('Upload ZIP File for Upgrade') }}</title>
</head>
<body>
    <h1>{{ __('Upload ZIP File to Upgrade Application') }}</h1>

    @if (session('success'))
        <p style="color: green;">{{ session('success') }}</p>
    @endif

    @if (session('error'))
        <p style="color: red;">{{ session('error') }}</p>
    @endif

    <form action="{{ route('upload.handle') }}" method="POST" enctype="multipart/form-data">
        @csrf
        <label for="zip_file">{{ __('Upload upgrade file:') }}</label>
        <input type="file" name="zip_file" id="zip_file" required>
        <button type="submit">{{ __('Upload') }}</button>
    </form>
</body>
</html>
