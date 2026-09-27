<?php
$conn = mysqli_connect("localhost", "root", "", "website_pasangan");

if (!$conn) {
    die("Koneksi gagal: " . mysqli_connect_error());
}
?>