/* =====================================================
   SUPABASE CONFIGURATION
===================================================== */

/*
    MASUKKAN DATA SUPABASE KAMU DI SINI

    Supabase Dashboard
    → Project Settings
    → API

    URL:
    Project URL

    KEY:
    Publishable key / anon key
*/

const SUPABASE_URL =
    "https://zfuufjwkgttrywcfmwsn.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_ozpU_wRFramJNDT5q-oIgw_BY_Iceub";


const STORAGE_BUCKET =
    "ALBUM-PHOTOS";


/* =====================================================
   SUPABASE CLIENT
===================================================== */

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =====================================================
   GLOBAL STATE
===================================================== */

let currentUser = null;

let currentAlbum = null;

let albumsCache = [];

let albumPhotosCache = [];


/* =====================================================
   HERO TEXT
===================================================== */

const heroTexts = [
    "Setiap hari bersamamu adalah rumah.",
    "Bersamamu, semua terasa cukup.",
    "Kita mungkin sederhana, tapi cerita kita istimewa.",
    "Terima kasih sudah menjadi bagian dari hidupku.",
    "Semoga cerita kita selalu punya halaman baru.",
    "Aku suka semua cerita yang melibatkan kita.",
    "Dari sekian banyak tempat, rumahku tetap kamu.",
    "Kalau ada kamu, semuanya terasa lebih baik."
];


let heroTextIndex = 0;


function changeHeroText() {

    const element =
        document.getElementById("heroTitle");

    if (!element) {
        return;
    }


    element.style.opacity = "0";


    setTimeout(() => {

        heroTextIndex++;

        if (
            heroTextIndex >=
            heroTexts.length
        ) {
            heroTextIndex = 0;
        }


        element.textContent =
            heroTexts[heroTextIndex];


        element.style.opacity = "1";

    }, 450);
}


setInterval(
    changeHeroText,
    5000
);


/* =====================================================
   UTILITY
===================================================== */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }


    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function formatTanggal(dateValue) {

    if (!dateValue) {
        return "-";
    }


    const date =
        new Date(dateValue);


    if (Number.isNaN(date.getTime())) {
        return escapeHTML(dateValue);
    }


    return date.toLocaleDateString(
        "id-ID",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );
}


function showMessage(
    elementId,
    message,
    type = "error"
) {

    const element =
        document.getElementById(elementId);

    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.className =
        "form-message " +
        type;
}


/* =====================================================
   TIME TOGETHER
===================================================== */

function updateTimeTogether() {

    const startDate =
        new Date("2024-04-24T00:00:00");


    const now =
        new Date();


    const difference =
        now.getTime() -
        startDate.getTime();


    if (difference < 0) {
        return;
    }


    const days =
        Math.floor(
            difference /
            (1000 * 60 * 60 * 24)
        );


    const hours =
        Math.floor(
            difference /
            (1000 * 60 * 60)
        );


    const daysElement =
        document.getElementById(
            "daysTogether"
        );


    const hoursElement =
        document.getElementById(
            "hoursTogether"
        );


    if (daysElement) {
        daysElement.textContent =
            days.toLocaleString("id-ID");
    }


    if (hoursElement) {
        hoursElement.textContent =
            hours.toLocaleString("id-ID");
    }
}


updateTimeTogether();


setInterval(
    updateTimeTogether,
    60000
);


/* =====================================================
   LOGIN
===================================================== */

function openLoginModal() {

    document
        .getElementById("loginModal")
        ?.classList
        .remove("hidden");
}


function closeLoginModal() {

    document
        .getElementById("loginModal")
        ?.classList
        .add("hidden");
}


async function loginAdmin(event) {

    event.preventDefault();


    const email =
        document
            .getElementById("loginEmail")
            .value
            .trim();


    const password =
        document
            .getElementById("loginPassword")
            .value;


    showMessage(
        "loginMessage",
        "Sedang masuk...",
        "info"
    );


    const {
        data,
        error
    } =
        await supabaseClient.auth
            .signInWithPassword({
                email,
                password
            });


    if (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );


        showMessage(
            "loginMessage",
            "Login gagal: " +
            error.message
        );


        return;
    }


    currentUser =
        data.user;


    closeLoginModal();

    updateAdminUI();

    await loadAlbums();
}


/* =====================================================
   LOGOUT
===================================================== */

async function logoutAdmin() {

    await supabaseClient.auth.signOut();

    currentUser = null;

    updateAdminUI();

    closeAlbumViewer();

    await loadAlbums();
}


/* =====================================================
   SESSION
===================================================== */

async function checkLogin() {

    const {
        data
    } =
        await supabaseClient.auth
            .getSession();


    currentUser =
        data.session?.user ||
        null;


    updateAdminUI();
}


function updateAdminUI() {

    const adminButton =
        document.getElementById(
            "adminButton"
        );


    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    const addAlbumButton =
        document.getElementById(
            "addAlbumButton"
        );


    if (currentUser) {

        adminButton
            ?.classList
            .add("hidden");


        logoutButton
            ?.classList
            .remove("hidden");


        addAlbumButton
            ?.classList
            .remove("hidden");

    } else {

        adminButton
            ?.classList
            .remove("hidden");


        logoutButton
            ?.classList
            .add("hidden");


        addAlbumButton
            ?.classList
            .add("hidden");
    }
}


/* =====================================================
   SUPABASE AUTH LISTENER
===================================================== */

supabaseClient.auth.onAuthStateChange(
    (_event, session) => {

        currentUser =
            session?.user ||
            null;

        updateAdminUI();
    }
);


/* =====================================================
   LOAD ALBUMS
===================================================== */

async function loadAlbums() {

    const list =
        document.getElementById(
            "timelineList"
        );


    if (!list) {
        return;
    }


    list.innerHTML =
        `
        <div class="loading">
            Memuat cerita kita...
        </div>
        `;


    const {
        data,
        error
    } =
        await supabaseClient
            .from("albums")
            .select("*")
            .order(
                "tanggal",
                {
                    ascending: true
                }
            );


    if (error) {

        console.error(
            "LOAD ALBUM ERROR:",
            error
        );


        list.innerHTML =
            `
            <div class="empty-state">
                <strong>
                    Gagal memuat album
                </strong>

                <p>
                    ${escapeHTML(error.message)}
                </p>
            </div>
            `;

        return;
    }


    albumsCache =
        data || [];


    await renderAlbums(
        albumsCache
    );
}


/* =====================================================
   GET ALBUM PHOTOS
===================================================== */

async function getAlbumPhotos(
    albumId
) {

    /*
        PENTING:

        Jangan gunakan Number(albumId).

        Supabase UUID harus dikirim
        sebagai UUID/string.
    */


    const {
        data,
        error
    } =
        await supabaseClient
            .from("album_photos")
            .select("*")
            .eq(
                "album_id",
                albumId
            )
            .order(
                "created_at",
                {
                    ascending: true
                }
            );


    if (error) {

        console.error(
            "LOAD PHOTO ERROR:",
            error
        );

        return [];
    }


    return data || [];
}


/* =====================================================
   RENDER ALBUMS
===================================================== */

async function renderAlbums(
    albums
) {

    const list =
        document.getElementById(
            "timelineList"
        );


    if (!list) {
        return;
    }


    if (!albums.length) {

        list.innerHTML =
            `
            <div class="empty-state">

                <strong>
                    Belum ada cerita ❤️
                </strong>

                <p>
                    Login sebagai admin
                    untuk membuat album pertama.
                </p>

            </div>
            `;

        return;
    }


    list.innerHTML = "";


    for (
        const album of albums
    ) {

        const photos =
            await getAlbumPhotos(
                album.id
            );


        const firstPhoto =
            photos.length
                ? photos[0].foto_url
                : (
                    album.cover_url ||
                    ""
                );


        const item =
            document.createElement(
                "article"
            );


        item.className =
            "timeline-item";


        item.innerHTML =
            `
            <div class="timeline-dot"></div>

            <div class="timeline-card">

                ${
                    firstPhoto
                    ?
                    `
                    <img
                        class="timeline-cover"
                        src="${escapeHTML(firstPhoto)}"
                        alt="${escapeHTML(
                            album.title ||
                            album.judul ||
                            "Album"
                        )}"
                        loading="lazy"
                    >
                    `
                    :
                    `
                    <div
                        class="timeline-cover"
                        style="
                            display:flex;
                            align-items:center;
                            justify-content:center;
                            font-size:70px;
                        "
                    >
                        ❤️
                    </div>
                    `
                }


                <div class="timeline-body">

                    <div class="timeline-date">
                        ${formatTanggal(
                            album.tanggal
                        )}
                    </div>


                    <h3 class="timeline-title">
                        ${escapeHTML(
                            album.title ||
                            album.judul ||
                            "Tanpa Judul"
                        )}
                    </h3>


                    ${
                        album.lokasi
                        ?
                        `
                        <div class="timeline-location">
                            📍
                            ${escapeHTML(
                                album.lokasi
                            )}
                        </div>
                        `
                        :
                        ""
                    }


                    ${
                        album.cerita
                        ?
                        `
                        <div class="timeline-story">
                            ${escapeHTML(
                                album.cerita
                            )}
                        </div>
                        `
                        :
                        ""
                    }


                    <div class="timeline-actions">

                        <button
                            class="primary-button"
                            onclick="openAlbum('${escapeHTML(
                                album.id
                            )}')"
                        >
                            Buka Album ❤️
                        </button>


                        ${
                            currentUser
                            ?
                            `
                            <button
                                class="secondary-button"
                                onclick="hapusAlbum('${escapeHTML(
                                    album.id
                                )}')"
                            >
                                Hapus Album
                            </button>
                            `
                            :
                            ""
                        }

                    </div>

                </div>

            </div>
            `;


        list.appendChild(item);
    }
}


/* =====================================================
   OPEN ALBUM
===================================================== */

async function openAlbum(
    albumId
) {

    /*
        albumId dipakai apa adanya.

        JANGAN:

        Number(albumId)

        karena ID bisa berupa UUID.
    */


    const viewer =
        document.getElementById(
            "albumViewer"
        );


    const content =
        document.getElementById(
            "albumViewerContent"
        );


    viewer
        ?.classList
        .remove("hidden");


    content.innerHTML =
        `
        <div class="loading">
            Membuka album...
        </div>
        `;


    const {
        data: album,
        error: albumError
    } =
        await supabaseClient
            .from("albums")
            .select("*")
            .eq(
                "id",
                albumId
            )
            .single();


    if (albumError) {

        console.error(
            "OPEN ALBUM ERROR:",
            albumError
        );


        content.innerHTML =
            `
            <div class="empty-state">
                Gagal membuka album.
                <br><br>
                ${escapeHTML(
                    albumError.message
                )}
            </div>
            `;

        return;
    }


    const photos =
        await getAlbumPhotos(
            albumId
        );


    currentAlbum =
        album;


    albumPhotosCache =
        photos;


    renderAlbumViewer(
        album,
        photos
    );
}


/* =====================================================
   RENDER ALBUM VIEWER
===================================================== */

function renderAlbumViewer(
    album,
    photos
) {

    const content =
        document.getElementById(
            "albumViewerContent"
        );


    const title =
        album.title ||
        album.judul ||
        "Tanpa Judul";


    content.innerHTML =
        `
        <div class="album-viewer-header">

            <div class="album-viewer-date">
                ${formatTanggal(
                    album.tanggal
                )}
            </div>


            <h2>
                ${escapeHTML(title)}
            </h2>


            ${
                album.lokasi
                ?
                `
                <div class="album-viewer-location">
                    📍
                    ${escapeHTML(
                        album.lokasi
                    )}
                </div>
                `
                :
                ""
            }


            ${
                album.cerita
                ?
                `
                <div class="album-viewer-story">
                    ${escapeHTML(
                        album.cerita
                    )}
                </div>
                `
                :
                ""
            }

        </div>


        <div class="album-toolbar">

            <h3>
                Foto Kenangan
            </h3>


            ${
                currentUser
                ?
                `
                <button
                    class="primary-button"
                    onclick="triggerAddPhotos()"
                >
                    + Tambahkan Foto
                </button>

                <input
                    id="additionalPhotos"
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onchange="addPhotosToCurrentAlbum(event)"
                >
                `
                :
                ""
            }

        </div>


        <div class="album-photo-grid">

            ${
                photos.length
                ?
                photos.map(
                    photo =>
                    `
                    <div
                        class="album-photo-item"
                    >

                        <img
                            src="${escapeHTML(
                                photo.foto_url
                            )}"
                            alt="Foto kenangan"
                            onclick="previewPhoto('${escapeHTML(
                                photo.foto_url
                            )}')"
                            loading="lazy"
                        >


                        ${
                            currentUser
                            ?
                            `
                            <button
                                class="delete-photo-button"
                                onclick="hapusFotoAlbum('${escapeHTML(
                                    photo.id
                                )}', '${escapeHTML(
                                    photo.foto_path ||
                                    ""
                                )}')"
                                title="Hapus foto"
                            >
                                ×
                            </button>
                            `
                            :
                            ""
                        }

                    </div>
                    `
                ).join("")
                :
                `
                <div
                    class="empty-state"
                    style="grid-column:1/-1"
                >
                    <strong>
                        Belum ada foto
                    </strong>

                    <p>
                        ${
                            currentUser
                            ?
                            "Klik Tambahkan Foto untuk menambahkan kenangan."
                            :
                            "Album ini belum memiliki foto."
                        }
                    </p>
                </div>
                `
            }

        </div>
        `;
}


/* =====================================================
   CLOSE ALBUM
===================================================== */

function closeAlbumViewer() {

    document
        .getElementById("albumViewer")
        ?.classList
        .add("hidden");


    currentAlbum =
        null;

    albumPhotosCache =
        [];
}


/* =====================================================
   PREVIEW PHOTO
===================================================== */

function previewPhoto(
    url
) {

    const win =
        window.open(
            "",
            "_blank"
        );


    if (!win) {
        return;
    }


    win.document.write(
        `
        <!DOCTYPE html>

        <html>

        <head>

            <title>Foto Kenangan ❤️</title>

            <style>

                * {
                    box-sizing:border-box;
                }

                html,
                body {
                    margin:0;
                    width:100%;
                    height:100%;
                    background:#050507;
                }

                body {
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    padding:20px;
                }

                img {
                    max-width:100%;
                    max-height:100%;
                    object-fit:contain;
                    border-radius:16px;
                }

            </style>

        </head>

        <body>

            <img
                src="${escapeHTML(url)}"
                alt="Foto"
            >

        </body>

        </html>
        `
    );
}


/* =====================================================
   ADD ALBUM MODAL
===================================================== */

function openAddAlbumModal() {

    if (!currentUser) {

        openLoginModal();

        return;
    }


    document
        .getElementById("albumModal")
        ?.classList
        .remove("hidden");
}


function closeAddAlbumModal() {

    document
        .getElementById("albumModal")
        ?.classList
        .add("hidden");


    document
        .getElementById("albumForm")
        ?.reset();


    const preview =
        document.getElementById(
            "albumPreview"
        );


    if (preview) {
        preview.innerHTML = "";
    }


    showMessage(
        "albumMessage",
        ""
    );
}


/* =====================================================
   PHOTO PREVIEW BEFORE UPLOAD
===================================================== */

document.addEventListener(
    "change",
    event => {

        if (
            event.target.id !==
            "albumPhotos"
        ) {
            return;
        }


        const preview =
            document.getElementById(
                "albumPreview"
            );


        if (!preview) {
            return;
        }


        preview.innerHTML = "";


        const files =
            Array.from(
                event.target.files || []
            );


        files.forEach(file => {

            const reader =
                new FileReader();


            reader.onload =
                event => {

                    const item =
                        document.createElement(
                            "div"
                        );


                    item.className =
                        "photo-preview-item";


                    item.innerHTML =
                        `
                        <img
                            src="${event.target.result}"
                            alt="Preview"
                        >
                        `;


                    preview.appendChild(
                        item
                    );
                };


            reader.readAsDataURL(
                file
            );
        });
    }
);


/* =====================================================
   CREATE ALBUM
===================================================== */

async function tambahAlbum(
    event
) {

    if (event) {
        event.preventDefault();
    }


    if (!currentUser) {

        openLoginModal();

        return;
    }


    const title =
        document
            .getElementById(
                "albumTitle"
            )
            .value
            .trim();


    const tanggal =
        document
            .getElementById(
                "albumDate"
            )
            .value;


    const lokasi =
        document
            .getElementById(
                "albumLocation"
            )
            .value
            .trim();


    const cerita =
        document
            .getElementById(
                "albumStory"
            )
            .value
            .trim();


    const photoInput =
        document.getElementById(
            "albumPhotos"
        );


    const files =
        Array.from(
            photoInput?.files || []
        );


    if (!title) {

        showMessage(
            "albumMessage",
            "Nama album wajib diisi."
        );

        return;
    }


    if (!tanggal) {

        showMessage(
            "albumMessage",
            "Tanggal album wajib diisi."
        );

        return;
    }


    const button =
        document.getElementById(
            "saveAlbumButton"
        );


    button.disabled = true;

    button.textContent =
        "Membuat album...";


    showMessage(
        "albumMessage",
        "Menyimpan album...",
        "info"
    );


    try {

        /*
            =================================================
            STEP 1
            INSERT ALBUM

            KUNCI PERBAIKAN:

            database membutuhkan kolom "title".

            Jadi kita kirim:

            title: title

            bukan hanya:

            judul: title
            =================================================
        */


        const {
            data: album,
            error: albumError
        } =
            await supabaseClient
                .from("albums")
                .insert({
                    title: title,
                    judul: title,
                    tanggal: tanggal,
                    lokasi: lokasi || null,
                    cerita: cerita || null,
                    cover_url: null,
                    cover_path: null
                })
                .select()
                .single();


        if (albumError) {

            console.error(
                "CREATE ALBUM ERROR:",
                albumError
            );


            throw new Error(
                albumError.message
            );
        }


        /*
            =================================================
            STEP 2
            UPLOAD FOTO
            =================================================
        */


        let uploadedPhotos = [];


        if (files.length > 0) {

            uploadedPhotos =
                await uploadAlbumPhotos(
                    album.id,
                    files
                );
        }


        /*
            =================================================
            STEP 3
            UPDATE COVER
            =================================================
        */


        if (
            uploadedPhotos.length > 0
        ) {

            const firstPhoto =
                uploadedPhotos[0];


            const {
                error: coverError
            } =
                await supabaseClient
                    .from("albums")
                    .update({
                        cover_url:
                            firstPhoto.foto_url,

                        cover_path:
                            firstPhoto.foto_path
                    })
                    .eq(
                        "id",
                        album.id
                    );


            if (coverError) {

                console.error(
                    "COVER UPDATE ERROR:",
                    coverError
                );
            }
        }


        showMessage(
            "albumMessage",
            "Album berhasil dibuat ❤️",
            "success"
        );


        /*
            Tunggu sedikit agar user
            sempat melihat pesan sukses.
        */


        setTimeout(
            async () => {

                closeAddAlbumModal();

                await loadAlbums();

            },
            600
        );


    } catch (error) {

        console.error(
            "TAMBAH ALBUM ERROR:",
            error
        );


        showMessage(
            "albumMessage",
            "Gagal membuat album: " +
            error.message
        );

    } finally {

        button.disabled = false;

        button.textContent =
            "Buat Album ❤️";
    }
}


/* =====================================================
   UPLOAD ALBUM PHOTOS
===================================================== */

async function uploadAlbumPhotos(
    albumId,
    files
) {

    const photoRows = [];


    for (
        let i = 0;
        i < files.length;
        i++
    ) {

        const file =
            files[i];


        if (
            !file.type.startsWith(
                "image/"
            )
        ) {
            continue;
        }


        /*
            Buat nama file unik.

            ID album tetap sebagai
            string / UUID.

            TIDAK menggunakan:

            Number(albumId)
        */


        const extension =
            file.name
                .split(".")
                .pop()
                .toLowerCase();


        const safeName =
            file.name
                .replace(
                    /[^a-zA-Z0-9._-]/g,
                    "-"
                );


        const fileName =
            Date.now() +
            "-" +
            i +
            "-" +
            safeName;


        const filePath =
            String(albumId) +
            "/" +
            fileName;


        /*
            =================================================
            UPLOAD STORAGE
            =================================================
        */


        const {
            data: uploadData,
            error: uploadError
        } =
            await supabaseClient
                .storage
                .from(
                    STORAGE_BUCKET
                )
                .upload(
                    filePath,
                    file,
                    {
                        cacheControl:
                            "3600",

                        upsert:
                            false,

                        contentType:
                            file.type
                    }
                );


        if (uploadError) {

            console.error(
                "UPLOAD ERROR:",
                uploadError
            );


            throw new Error(
                "Upload foto gagal: " +
                uploadError.message
            );
        }


        /*
            =================================================
            PUBLIC URL
            =================================================
        */


        const {
            data:
                publicUrlData
        } =
            supabaseClient
                .storage
                .from(
                    STORAGE_BUCKET
                )
                .getPublicUrl(
                    uploadData.path
                );


        const publicUrl =
            publicUrlData.publicUrl;


        /*
            =================================================
            INSERT PHOTO DATABASE
            =================================================

            PENTING:

            album_id dikirim langsung.

            BUKAN:

            Number(albumId)
        */


        photoRows.push({
            album_id:
                albumId,

            foto_url:
                publicUrl,

            foto_path:
                uploadData.path
        });
    }


    /*
        =====================================================
        INSERT SEMUA FOTO
        =====================================================
    */


    if (photoRows.length > 0) {

        const {
            error
        } =
            await supabaseClient
                .from(
                    "album_photos"
                )
                .insert(
                    photoRows
                );


        if (error) {

            console.error(
                "INSERT PHOTO ERROR:",
                error
            );


            /*
                Jika database gagal,
                hapus file yang sudah
                berhasil di-upload.
            */


            for (
                const photo
                of photoRows
            ) {

                await supabaseClient
                    .storage
                    .from(
                        STORAGE_BUCKET
                    )
                    .remove([
                        photo.foto_path
                    ]);
            }


            throw new Error(
                "Foto gagal disimpan: " +
                error.message
            );
        }
    }


    return photoRows;
}


/* =====================================================
   ADD PHOTOS TO EXISTING ALBUM
===================================================== */

function triggerAddPhotos() {

    if (!currentUser) {

        openLoginModal();

        return;
    }


    const input =
        document.getElementById(
            "additionalPhotos"
        );


    if (input) {
        input.click();
    }
}


async function addPhotosToCurrentAlbum(
    event
) {

    if (!currentUser) {

        openLoginModal();

        return;
    }


    if (!currentAlbum) {

        alert(
            "Album belum dipilih."
        );

        return;
    }


    const files =
        Array.from(
            event.target.files || []
        );


    if (!files.length) {
        return;
    }


    try {

        const newPhotos =
            await uploadAlbumPhotos(
                currentAlbum.id,
                files
            );


        /*
            Tambahkan foto baru
            ke cache.
        */


        albumPhotosCache =
            [
                ...albumPhotosCache,
                ...newPhotos
            ];


        /*
            Update cover kalau
            album belum punya cover.
        */


        if (
            !currentAlbum.cover_url &&
            newPhotos.length
        ) {

            await supabaseClient
                .from("albums")
                .update({
                    cover_url:
                        newPhotos[0].foto_url,

                    cover_path:
                        newPhotos[0].foto_path
                })
                .eq(
                    "id",
                    currentAlbum.id
                );


            currentAlbum.cover_url =
                newPhotos[0].foto_url;

            currentAlbum.cover_path =
                newPhotos[0].foto_path;
        }


        renderAlbumViewer(
            currentAlbum,
            albumPhotosCache
        );


        await loadAlbums();


        alert(
            "Foto berhasil ditambahkan ❤️"
        );


    } catch (error) {

        console.error(
            "ADD PHOTO ERROR:",
            error
        );


        alert(
            "Gagal menambahkan foto:\n" +
            error.message
        );

    } finally {

        event.target.value = "";
    }
}


/* =====================================================
   DELETE PHOTO
===================================================== */

async function hapusFotoAlbum(
    photoId,
    photoPath
) {

    if (!currentUser) {
        return;
    }


    const confirmDelete =
        confirm(
            "Hapus foto ini?"
        );


    if (!confirmDelete) {
        return;
    }


    try {

        /*
            Hapus database
        */


        const {
            error: deleteError
        } =
            await supabaseClient
                .from(
                    "album_photos"
                )
                .delete()
                .eq(
                    "id",
                    photoId
                );


        if (deleteError) {

            throw new Error(
                deleteError.message
            );
        }


        /*
            Hapus Storage
        */


        if (photoPath) {

            const {
                error:
                    storageError
            } =
                await supabaseClient
                    .storage
                    .from(
                        STORAGE_BUCKET
                    )
                    .remove([
                        photoPath
                    ]);


            if (storageError) {

                console.warn(
                    "Storage delete warning:",
                    storageError
                );
            }
        }


        /*
            Reload album
        */


        await openAlbum(
            currentAlbum.id
        );


        await loadAlbums();


    } catch (error) {

        console.error(
            "DELETE PHOTO ERROR:",
            error
        );


        alert(
            "Gagal menghapus foto:\n" +
            error.message
        );
    }
}


/* =====================================================
   DELETE ALBUM
===================================================== */

async function hapusAlbum(
    albumId
) {

    if (!currentUser) {
        return;
    }


    const confirmDelete =
        confirm(
            "Hapus album ini beserta semua fotonya?"
        );


    if (!confirmDelete) {
        return;
    }


    try {

        /*
            Ambil foto album
        */


        const photos =
            await getAlbumPhotos(
                albumId
            );


        /*
            Hapus file dari Storage
        */


        const paths =
            photos
                .map(
                    photo =>
                        photo.foto_path
                )
                .filter(Boolean);


        if (paths.length) {

            await supabaseClient
                .storage
                .from(
                    STORAGE_BUCKET
                )
                .remove(paths);
        }


        /*
            Hapus foto database
        */


        const {
            error:
                photosDeleteError
        } =
            await supabaseClient
                .from(
                    "album_photos"
                )
                .delete()
                .eq(
                    "album_id",
                    albumId
                );


        if (
            photosDeleteError
        ) {

            throw new Error(
                photosDeleteError.message
            );
        }


        /*
            Hapus album
        */


        const {
            error:
                albumDeleteError
        } =
            await supabaseClient
                .from("albums")
                .delete()
                .eq(
                    "id",
                    albumId
                );


        if (
            albumDeleteError
        ) {

            throw new Error(
                albumDeleteError.message
            );
        }


        await loadAlbums();


        alert(
            "Album berhasil dihapus."
        );


    } catch (error) {

        console.error(
            "DELETE ALBUM ERROR:",
            error
        );


        alert(
            "Gagal menghapus album:\n" +
            error.message
        );
    }
}


/* =====================================================
   PLAYLIST
===================================================== */

function openPlaylist(event) {

    if (event) {
        event.preventDefault();
    }


    document
        .getElementById(
            "playlistModal"
        )
        ?.classList
        .remove("hidden");
}


function closePlaylist() {

    document
        .getElementById(
            "playlistModal"
        )
        ?.classList
        .add("hidden");
}


/* =====================================================
   CLOSE MODAL WITH ESCAPE
===================================================== */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !==
            "Escape"
        ) {
            return;
        }


        closeLoginModal();

        closeAddAlbumModal();

        closeAlbumViewer();

        closePlaylist();
    }
);


/* =====================================================
   COMPATIBILITY WITH OLD HTML
===================================================== */

/*
    HTML lama kamu menggunakan:

    onclick="tambahKenangan()"

    Sedangkan sistem album sekarang
    menggunakan:

    tambahAlbum()

    Jadi kita sediakan jembatan supaya
    HTML lama tidak error.
*/


function tambahKenangan(
    event
) {

    return tambahAlbum(
        event
    );
}


/* =====================================================
   GLOBAL FUNCTIONS
===================================================== */

window.openLoginModal =
    openLoginModal;

window.closeLoginModal =
    closeLoginModal;

window.loginAdmin =
    loginAdmin;

window.logoutAdmin =
    logoutAdmin;

window.openAddAlbumModal =
    openAddAlbumModal;

window.closeAddAlbumModal =
    closeAddAlbumModal;

window.tambahAlbum =
    tambahAlbum;

window.tambahKenangan =
    tambahKenangan;

window.openAlbum =
    openAlbum;

window.closeAlbumViewer =
    closeAlbumViewer;

window.previewPhoto =
    previewPhoto;

window.triggerAddPhotos =
    triggerAddPhotos;

window.addPhotosToCurrentAlbum =
    addPhotosToCurrentAlbum;

window.hapusFotoAlbum =
    hapusFotoAlbum;

window.hapusAlbum =
    hapusAlbum;

window.openPlaylist =
    openPlaylist;

window.closePlaylist =
    closePlaylist;


/* =====================================================
   INITIALIZATION
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        /*
            Jangan menjalankan Supabase
            kalau konfigurasi belum diganti.
        */


        if (
            SUPABASE_URL.includes(
                "MASUKKAN_"
            ) ||
            SUPABASE_KEY.includes(
                "MASUKKAN_"
            )
        ) {

            console.warn(
                "Supabase belum dikonfigurasi."
            );


            const list =
                document.getElementById(
                    "timelineList"
                );


            if (list) {

                list.innerHTML =
                    `
                    <div class="empty-state">

                        <strong>
                            Supabase belum dikonfigurasi
                        </strong>

                        <p>
                            Buka script.js lalu
                            masukkan Supabase URL
                            dan Publishable Key.
                        </p>

                    </div>
                    `;
            }


            return;
        }


        await checkLogin();

        await loadAlbums();

    }
);