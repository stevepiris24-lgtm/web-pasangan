/* =========================================================
   SUPABASE CONFIGURATION
========================================================= */

const SUPABASE_URL =
    "https://zfuufjwkgttrywcfmwsn.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_ozpU_wRFramJNDT5q-oIgw_BY_Iceub";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =========================================================
   SUPABASE STORAGE
========================================================= */

const STORAGE_BUCKET = "ALBUM-PHOTOS";


/* =========================================================
   HUBUNGAN
========================================================= */

const startDate =
    new Date("2024-04-24");


const texts = [

    "Setiap hari bersamamu adalah rumah.",

    "Kamu adalah tempat pulang terbaikku.",

    "Bersamamu, semua terasa cukup.",

    "Aku memilihmu setiap hari ❤️",

    "Kita, selamanya bukan sekadar kata."

];


let textIndex = 0;


/* =========================================================
   ELEMENT
========================================================= */

const timelineList =
    document.getElementById("timelineList");

const addForm =
    document.getElementById("addForm");

const loginBox =
    document.getElementById("loginBox");

const adminPanel =
    document.getElementById("adminPanel");


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");
}


/* =========================================================
   FORMAT TANGGAL
========================================================= */

function formatTanggal(tanggal) {

    if (!tanggal) {
        return "";
    }

    const date =
        new Date(`${tanggal}T00:00:00`);

    return date.toLocaleDateString(
        "id-ID",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


/* =========================================================
   FORMAT JUMLAH FOTO
========================================================= */

function formatJumlahFoto(jumlah) {

    if (jumlah === 1) {
        return "1 foto";
    }

    return `${jumlah} foto`;
}


/* =========================================================
   HERO TEXT
========================================================= */

function changeText() {

    const el =
        document.getElementById("dynamicText");

    if (!el) {
        return;
    }

    el.style.opacity = 0;

    setTimeout(() => {

        el.innerText =
            texts[textIndex];

        el.style.opacity = 1;

        textIndex =
            (textIndex + 1) %
            texts.length;

    }, 500);
}


setInterval(changeText, 3000);


/* =========================================================
   TIMER
========================================================= */

function updateTime() {

    const now =
        new Date();

    const diff =
        now - startDate;


    const days =
        Math.floor(
            diff /
            (1000 * 60 * 60 * 24)
        );


    const hours =
        Math.floor(
            diff /
            (1000 * 60 * 60)
        );


    const timer =
        document.getElementById("timer");


    const jam =
        document.getElementById("jam");


    if (timer) {

        timer.innerText =
            `Sejak 24 April 2024 — sudah ${days} hari bersama ❤️`;

    }


    if (jam) {

        jam.innerText =
            `${hours.toLocaleString("id-ID")} jam bersama ⏳`;

    }

}


updateTime();

setInterval(updateTime, 1000);


/* =========================================================
   LOAD ALBUM
========================================================= */

async function loadTimeline() {

    if (!timelineList) {
        return;
    }


    timelineList.innerHTML = `

        <div class="loading">

            Memuat album cerita kita... ❤️

        </div>

    `;


    try {

        /*
            Ambil semua album
        */

        const {
            data: albums,
            error: albumError
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


        if (albumError) {

            throw albumError;

        }


        /*
            Ambil semua foto
        */

        const {
            data: photos,
            error: photoError
        } =
            await supabaseClient

                .from("album_photos")

                .select("*")

                .order(
                    "created_at",
                    {
                        ascending: true
                    }
                );


        if (photoError) {

            throw photoError;

        }


        renderAlbums(
            albums || [],
            photos || []
        );


    } catch (error) {

        console.error(error);


        timelineList.innerHTML = `

            <div class="empty-state">

                <strong>
                    Gagal memuat album
                </strong>

                <span>
                    ${escapeHTML(error.message)}
                </span>

            </div>

        `;

    }

}


/* =========================================================
   RENDER ALBUM
========================================================= */

function renderAlbums(
    albums,
    photos
) {

    if (!albums.length) {

        timelineList.innerHTML = `

            <div class="empty-state">

                <strong>
                    Belum ada album ❤️
                </strong>

                <span>
                    Login sebagai admin untuk membuat album pertama.
                </span>

            </div>

        `;

        return;

    }


    timelineList.innerHTML = "";


    albums.forEach(album => {

        /*
            Cari foto album
        */

        const albumPhotos =
            photos.filter(
                photo =>
                    Number(photo.album_id) ===
                    Number(album.id)
            );


        /*
            Cover album
        */

        let coverHTML = "";


        if (
            album.cover_url
        ) {

            coverHTML = `

                <img
                    class="album-cover"
                    src="${escapeHTML(album.cover_url)}"
                    alt="${escapeHTML(album.judul)}"
                    loading="lazy"
                >

            `;

        } else if (
            albumPhotos.length
        ) {

            coverHTML = `

                <img
                    class="album-cover"
                    src="${escapeHTML(albumPhotos[0].foto_url)}"
                    alt="${escapeHTML(album.judul)}"
                    loading="lazy"
                >

            `;

        } else {

            coverHTML = `

                <div class="album-cover album-no-photo">

                    ❤️

                </div>

            `;

        }


        /*
            Buat card
        */

        const card =
            document.createElement("article");


        card.className =
            "album-card";


        card.innerHTML = `

            <div
                class="album-cover-wrapper"
                onclick="openAlbum(${album.id})"
            >

                ${coverHTML}


                <div class="album-photo-count">

                    📷
                    ${formatJumlahFoto(albumPhotos.length)}

                </div>

            </div>


            <div class="album-content">

                <div class="album-date">

                    ${formatTanggal(album.tanggal)}

                </div>


                <h3>

                    ${escapeHTML(album.judul)}

                </h3>


                ${
                    album.lokasi
                    ?
                    `
                    <div class="album-location">

                        📍 ${escapeHTML(album.lokasi)}

                    </div>
                    `
                    :
                    ""
                }


                ${
                    album.cerita
                    ?
                    `
                    <p class="album-story">

                        ${escapeHTML(album.cerita)}

                    </p>
                    `
                    :
                    ""
                }


                <button
                    class="album-open-btn"
                    onclick="openAlbum(${album.id})"
                >

                    Lihat Album ❤️

                </button>


                <button
                    class="delete-album-btn"
                    onclick="hapusAlbum(${album.id})"
                >

                    Hapus Album

                </button>

            </div>

        `;


        timelineList.appendChild(card);

    });

}


/* =========================================================
   OPEN ALBUM
========================================================= */

async function openAlbum(albumId) {

    try {

        const {
            data: album,
            error: albumError
        } =
            await supabaseClient

                .from("albums")

                .select("*")

                .eq("id", albumId)

                .single();


        if (albumError) {
            throw albumError;
        }


        const {
            data: photos,
            error: photoError
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


        if (photoError) {
            throw photoError;
        }


        showAlbumViewer(
            album,
            photos || []
        );


    } catch (error) {

        console.error(error);

        alert(
            "Gagal membuka album: " +
            error.message
        );

    }

}


/* =========================================================
   ALBUM VIEWER
========================================================= */

function showAlbumViewer(
    album,
    photos
) {

    let viewer =
        document.getElementById(
            "albumViewer"
        );


    /*
        Kalau belum ada,
        buat otomatis
    */

    if (!viewer) {

        viewer =
            document.createElement("div");

        viewer.id =
            "albumViewer";

        viewer.className =
            "album-viewer";

        document.body.appendChild(
            viewer
        );

    }


    let photosHTML = "";


    if (!photos.length) {

        photosHTML = `

            <div class="album-empty">

                Belum ada foto di album ini ❤️

            </div>

        `;

    } else {

        photos.forEach(photo => {

            photosHTML += `

                <div
                    class="album-photo-item"
                >

                    <img
                        src="${escapeHTML(photo.foto_url)}"
                        alt="Foto album"
                        loading="lazy"
                        onclick="previewPhoto('${escapeHTML(photo.foto_url)}')"
                    >


                    <button
                        class="delete-photo-btn"
                        onclick="hapusFotoAlbum(${photo.id})"
                    >

                        ×

                    </button>

                </div>

            `;

        });

    }


    viewer.innerHTML = `

        <div
            class="album-viewer-overlay"
            onclick="closeAlbum(event)"
        >

            <div
                class="album-viewer-content"
                onclick="event.stopPropagation()"
            >


                <button
                    class="album-close-btn"
                    onclick="closeAlbum()"
                >

                    ×

                </button>


                <div class="album-viewer-header">

                    <div>

                        <div class="album-viewer-date">

                            ${formatTanggal(album.tanggal)}

                        </div>


                        <h2>

                            ${escapeHTML(album.judul)}

                        </h2>


                        ${
                            album.lokasi
                            ?
                            `
                            <p>

                                📍 ${escapeHTML(album.lokasi)}

                            </p>
                            `
                            :
                            ""
                        }

                    </div>

                </div>


                ${
                    album.cerita
                    ?
                    `
                    <div class="album-viewer-story">

                        ${escapeHTML(album.cerita)}

                    </div>
                    `
                    :
                    ""
                }


                <div
                    class="album-photo-grid"
                    id="albumPhotoGrid"
                >

                    ${photosHTML}

                </div>


                <div class="album-admin-upload">

                    <label>

                        Tambahkan foto ke album

                    </label>


                    <input
                        type="file"
                        id="albumPhotos"
                        accept="image/*"
                        multiple
                    >


                    <button
                        onclick="uploadAlbumPhotos(${album.id})"
                    >

                        + Tambah Foto ❤️

                    </button>


                    <div
                        id="albumUploadMessage"
                        class="album-upload-message"
                    ></div>

                </div>


            </div>

        </div>

    `;


    requestAnimationFrame(() => {

        viewer.classList.add("show");

    });


    document.body.style.overflow =
        "hidden";

}


/* =========================================================
   CLOSE ALBUM
========================================================= */

function closeAlbum(event) {

    if (
        event &&
        event.target &&
        !event.target.classList.contains(
            "album-viewer-overlay"
        )
    ) {
        return;
    }


    const viewer =
        document.getElementById(
            "albumViewer"
        );


    if (!viewer) {
        return;
    }


    viewer.classList.remove(
        "show"
    );


    setTimeout(() => {

        viewer.innerHTML = "";

        document.body.style.overflow =
            "";

    }, 250);

}


/* =========================================================
   PREVIEW FOTO
========================================================= */

function previewPhoto(url) {

    const preview =
        document.createElement("div");


    preview.className =
        "photo-preview";


    preview.innerHTML = `

        <div
            class="photo-preview-overlay"
            onclick="this.parentElement.remove()"
        >

            <button
                class="photo-preview-close"
            >

                ×

            </button>


            <img
                src="${escapeHTML(url)}"
                alt="Preview foto"
            >

        </div>

    `;


    document.body.appendChild(
        preview
    );

}


/* =========================================================
   OPEN ADD FORM
========================================================= */

async function openAddForm() {

    const {
        data
    } =
        await supabaseClient.auth
            .getUser();


    if (!data.user) {

        loginBox.classList.add(
            "show"
        );


        loginBox.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });


        showLoginMessage(
            "Login admin terlebih dahulu."
        );


        return;

    }


    /*
        Ubah form lama menjadi
        form TAMBAH ALBUM
    */

    prepareAlbumForm();


    addForm.classList.add(
        "show"
    );


    addForm.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


/* =========================================================
   PREPARE FORM ALBUM
========================================================= */

function prepareAlbumForm() {

    if (!addForm) {
        return;
    }


    const title =
        addForm.querySelector(
            ".form-title"
        );


    if (title) {

        title.innerHTML =
            "Buat Album Baru ❤️";

    }


    const labels =
        addForm.querySelectorAll(
            "label"
        );


    if (labels.length >= 5) {

        labels[0].innerText =
            "Nama Album";

        labels[1].innerText =
            "Tanggal";

        labels[2].innerText =
            "Lokasi";

        labels[3].innerText =
            "Cerita Album";

        labels[4].innerText =
            "Foto Album";

    }


    const judul =
        document.getElementById(
            "judul"
        );


    if (judul) {

        judul.placeholder =
            "Contoh: Perjalanan Pertama Kita";

    }


    const cerita =
        document.getElementById(
            "cerita"
        );


    if (cerita) {

        cerita.placeholder =
            "Ceritakan tentang album ini...";

    }


    const foto =
        document.getElementById(
            "foto"
        );


    if (foto) {

        foto.multiple = true;

        foto.accept =
            "image/*";

    }


    const saveButton =
        addForm.querySelector(
            ".save-btn"
        );


    if (saveButton) {

        saveButton.innerText =
            "Buat Album ❤️";

        saveButton.onclick =
            tambahAlbum;

    }

}


/* =========================================================
   CLOSE ADD FORM
========================================================= */

function closeAddForm() {

    if (!addForm) {
        return;
    }


    addForm.classList.remove(
        "show"
    );

}


/* =========================================================
   LOGIN ADMIN
========================================================= */

async function loginAdmin() {

    const email =
        document
            .getElementById(
                "adminEmail"
            )
            .value
            .trim();


    const password =
        document
            .getElementById(
                "adminPassword"
            )
            .value;


    if (
        !email ||
        !password
    ) {

        showLoginMessage(
            "Email dan password harus diisi."
        );

        return;

    }


    showLoginMessage(
        "Sedang login..."
    );


    const {
        data,
        error
    } =
        await supabaseClient.auth
            .signInWithPassword({

                email:
                    email,

                password:
                    password

            });


    if (error) {

        console.error(error);


        showLoginMessage(
            "Login gagal: " +
            error.message
        );


        return;

    }


    updateAdminUI(
        data.user
    );


    showLoginMessage(
        "Login berhasil ❤️"
    );


    document
        .getElementById(
            "adminPassword"
        )
        .value = "";

}


/* =========================================================
   LOGIN MESSAGE
========================================================= */

function showLoginMessage(
    message
) {

    const el =
        document.getElementById(
            "loginMessage"
        );


    if (el) {

        el.innerText =
            message;

    }

}


/* =========================================================
   LOGOUT
========================================================= */

async function logoutAdmin() {

    await supabaseClient.auth
        .signOut();


    closeAddForm();


    updateAdminUI(
        null
    );

}


/* =========================================================
   ADMIN UI
========================================================= */

function updateAdminUI(user) {

    if (user) {

        if (loginBox) {

            loginBox.classList.remove(
                "show"
            );

        }


        if (adminPanel) {

            adminPanel.classList.add(
                "show"
            );

        }


        const emailText =
            document.getElementById(
                "adminEmailText"
            );


        if (emailText) {

            emailText.innerText =
                user.email || "";

        }


        document.body.classList.add(
            "admin-active"
        );

    } else {

        if (adminPanel) {

            adminPanel.classList.remove(
                "show"
            );

        }


        document.body.classList.remove(
            "admin-active"
        );

    }

}


/* =========================================================
   CHECK LOGIN
========================================================= */

async function checkLogin() {

    const {
        data
    } =
        await supabaseClient.auth
            .getUser();


    if (data.user) {

        updateAdminUI(
            data.user
        );

    } else {

        updateAdminUI(
            null
        );

    }

}


/* =========================================================
   TAMBAH ALBUM
========================================================= */

async function tambahAlbum() {

    const judul =
        document
            .getElementById(
                "judul"
            )
            .value
            .trim();


    const tanggal =
        document
            .getElementById(
                "tanggal"
            )
            .value;


    const lokasi =
        document
            .getElementById(
                "lokasi"
            )
            .value
            .trim();


    const cerita =
        document
            .getElementById(
                "cerita"
            )
            .value
            .trim();


    const fileInput =
        document
            .getElementById(
                "foto"
            );


    const files =
        Array.from(
            fileInput.files
        );


    const message =
        document
            .getElementById(
                "formMessage"
            );


    /* =====================================
       VALIDASI
    ===================================== */

    if (
        !judul ||
        !tanggal
    ) {

        message.innerText =
            "Nama album dan tanggal wajib diisi.";

        return;

    }


    if (!files.length) {

        message.innerText =
            "Pilih minimal 1 foto.";

        return;

    }


    /*
        Maksimal 6 MB per foto
    */

    const tooLarge =
        files.some(
            file =>
                file.size >
                6 * 1024 * 1024
        );


    if (tooLarge) {

        message.innerText =
            "Setiap foto maksimal 6 MB.";

        return;

    }


    const invalid =
        files.some(
            file =>
                !file.type.startsWith(
                    "image/"
                )
        );


    if (invalid) {

        message.innerText =
            "Semua file harus berupa gambar.";

        return;

    }


    /*
        CEK LOGIN
    */

    const {
        data: userData
    } =
        await supabaseClient.auth
            .getUser();


    if (!userData.user) {

        message.innerText =
            "Sesi admin sudah berakhir.";

        return;

    }


    message.innerText =
        "Membuat album... ⏳";


    let uploadedFiles = [];


    try {

        /*
            1. Buat album dahulu
        */

        const {
            data: album,
            error: albumError
        } =
            await supabaseClient

                .from("albums")

                .insert({

                    judul:
                        judul,

                    tanggal:
                        tanggal,

                    lokasi:
                        lokasi,

                    cerita:
                        cerita

                })

                .select()

                .single();


        if (albumError) {

            throw albumError;

        }


        /*
            2. Upload semua foto
        */

        const photoRows = [];


        for (
            let i = 0;
            i < files.length;
            i++
        ) {

            const file =
                files[i];


            message.innerText =
                `Mengupload foto ${i + 1} dari ${files.length}... ⏳`;


            const extension =
                file.name
                    .split(".")
                    .pop()
                    .toLowerCase();


            const fileName =
                `${crypto.randomUUID()}.${extension}`;


            const filePath =
                `albums/${album.id}/${fileName}`;


            const {
                data: uploadData,
                error: uploadError
            } =
                await supabaseClient.storage

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

                throw uploadError;

            }


            uploadedFiles.push(
                uploadData.path
            );


            const {
                data: publicUrlData
            } =
                supabaseClient.storage

                    .from(
                        STORAGE_BUCKET
                    )

                    .getPublicUrl(
                        uploadData.path
                    );


            const fotoUrl =
                publicUrlData.publicUrl;


            photoRows.push({

                album_id:
                    album.id,

                foto_url:
                    fotoUrl,

                foto_path:
                    uploadData.path

            });

        }


        /*
            3. Simpan semua foto
        */

        message.innerText =
            "Menyimpan foto ke album... ❤️";


        const {
            error: photoInsertError
        } =
            await supabaseClient

                .from(
                    "album_photos"
                )

                .insert(
                    photoRows
                );


        if (photoInsertError) {

            throw photoInsertError;

        }


        /*
            4. Foto pertama menjadi cover
        */

        const coverUrl =
            photoRows[0].foto_url;


        const coverPath =
            photoRows[0].foto_path;


        const {
            error: coverError
        } =
            await supabaseClient

                .from("albums")

                .update({

                    cover_url:
                        coverUrl,

                    cover_path:
                        coverPath

                })

                .eq(
                    "id",
                    album.id
                );


        if (coverError) {

            throw coverError;

        }


        /*
            BERHASIL
        */

        message.innerText =
            "Album berhasil dibuat ❤️";


        /*
            Reset
        */

        document
            .getElementById(
                "judul"
            )
            .value = "";


        document
            .getElementById(
                "tanggal"
            )
            .value = "";


        document
            .getElementById(
                "lokasi"
            )
            .value = "";


        document
            .getElementById(
                "cerita"
            )
            .value = "";


        fileInput.value = "";


        /*
            Refresh album
        */

        await loadTimeline();


        setTimeout(() => {

            closeAddForm();

            message.innerText = "";

        }, 1000);


    } catch (error) {

        console.error(error);


        /*
            Kalau upload gagal,
            hapus file yang sudah berhasil diupload
        */

        if (
            uploadedFiles.length
        ) {

            await supabaseClient.storage

                .from(
                    STORAGE_BUCKET
                )

                .remove(
                    uploadedFiles
                );

        }


        message.innerText =
            "Gagal membuat album: " +
            error.message;

    }

}


/* =========================================================
   UPLOAD FOTO KE ALBUM YANG SUDAH ADA
========================================================= */

async function uploadAlbumPhotos(
    albumId
) {

    const fileInput =
        document.getElementById(
            "albumPhotos"
        );


    const message =
        document.getElementById(
            "albumUploadMessage"
        );


    if (
        !fileInput ||
        !fileInput.files.length
    ) {

        if (message) {

            message.innerText =
                "Pilih foto terlebih dahulu.";

        }

        return;

    }


    const files =
        Array.from(
            fileInput.files
        );


    /*
        Validasi
    */

    for (const file of files) {

        if (
            !file.type.startsWith(
                "image/"
            )
        ) {

            message.innerText =
                "Semua file harus berupa gambar.";

            return;

        }


        if (
            file.size >
            6 * 1024 * 1024
        ) {

            message.innerText =
                "Ukuran setiap foto maksimal 6 MB.";

            return;

        }

    }


    /*
        Cek login
    */

    const {
        data: userData
    } =
        await supabaseClient.auth
            .getUser();


    if (!userData.user) {

        message.innerText =
            "Silakan login sebagai admin.";

        return;

    }


    let uploadedPaths = [];


    try {

        const photoRows = [];


        for (
            let i = 0;
            i < files.length;
            i++
        ) {

            const file =
                files[i];


            message.innerText =
                `Mengupload ${i + 1} dari ${files.length}... ⏳`;


            const extension =
                file.name
                    .split(".")
                    .pop()
                    .toLowerCase();


            const fileName =
                `${crypto.randomUUID()}.${extension}`;


            const filePath =
                `albums/${albumId}/${fileName}`;


            const {
                data: uploadData,
                error: uploadError
            } =
                await supabaseClient.storage

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

                throw uploadError;

            }


            uploadedPaths.push(
                uploadData.path
            );


            const {
                data: publicUrlData
            } =
                supabaseClient.storage

                    .from(
                        STORAGE_BUCKET
                    )

                    .getPublicUrl(
                        uploadData.path
                    );


            photoRows.push({

                album_id:
                    albumId,

                foto_url:
                    publicUrlData.publicUrl,

                foto_path:
                    uploadData.path

            });

        }


        /*
            Simpan ke database
        */

        const {
            error: insertError
        } =
            await supabaseClient

                .from(
                    "album_photos"
                )

                .insert(
                    photoRows
                );


        if (insertError) {

            throw insertError;

        }


        /*
            Kalau album belum punya cover,
            foto pertama dijadikan cover
        */

        const {
            data: album
        } =
            await supabaseClient

                .from("albums")

                .select(
                    "cover_url"
                )

                .eq(
                    "id",
                    albumId
                )

                .single();


        if (
            album &&
            !album.cover_url
        ) {

            await supabaseClient

                .from("albums")

                .update({

                    cover_url:
                        photoRows[0]
                            .foto_url,

                    cover_path:
                        photoRows[0]
                            .foto_path

                })

                .eq(
                    "id",
                    albumId
                );

        }


        message.innerText =
            "Foto berhasil ditambahkan ❤️";


        fileInput.value = "";


        /*
            Buka ulang album
        */

        setTimeout(() => {

            openAlbum(
                albumId
            );

        }, 700);


        /*
            Refresh kartu album
        */

        await loadTimeline();


    } catch (error) {

        console.error(error);


        /*
            Hapus file jika database gagal
        */

        if (
            uploadedPaths.length
        ) {

            await supabaseClient.storage

                .from(
                    STORAGE_BUCKET
                )

                .remove(
                    uploadedPaths
                );

        }


        message.innerText =
            "Upload gagal: " +
            error.message;

    }

}


/* =========================================================
   HAPUS FOTO DALAM ALBUM
========================================================= */

async function hapusFotoAlbum(
    photoId
) {

    const yakin =
        confirm(
            "Yakin ingin menghapus foto ini?"
        );


    if (!yakin) {
        return;
    }


    /*
        Cek admin
    */

    const {
        data: userData
    } =
        await supabaseClient.auth
            .getUser();


    if (!userData.user) {

        alert(
            "Silakan login sebagai admin."
        );

        return;

    }


    try {

        /*
            Ambil foto
        */

        const {
            data: photo,
            error: findError
        } =
            await supabaseClient

                .from(
                    "album_photos"
                )

                .select("*")

                .eq(
                    "id",
                    photoId
                )

                .single();


        if (findError) {

            throw findError;

        }


        /*
            Hapus Storage
        */

        if (
            photo.foto_path
        ) {

            const {
                error: storageError
            } =
                await supabaseClient.storage

                    .from(
                        STORAGE_BUCKET
                    )

                    .remove([
                        photo.foto_path
                    ]);


            if (storageError) {

                throw storageError;

            }

        }


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

            throw deleteError;

        }


        /*
            Kalau foto yang dihapus
            adalah cover,
            cari foto lain
        */

        const {
            data: album
        } =
            await supabaseClient

                .from("albums")

                .select("*")

                .eq(
                    "id",
                    photo.album_id
                )

                .single();


        if (
            album &&
            album.cover_path ===
            photo.foto_path
        ) {

            const {
                data: nextPhoto
            } =
                await supabaseClient

                    .from(
                        "album_photos"
                    )

                    .select("*")

                    .eq(
                        "album_id",
                        photo.album_id
                    )

                    .order(
                        "created_at",
                        {
                            ascending:
                                true
                        }
                    )
                    .limit(1)
                    .maybeSingle();


            if (nextPhoto) {

                await supabaseClient

                    .from("albums")

                    .update({

                        cover_url:
                            nextPhoto.foto_url,

                        cover_path:
                            nextPhoto.foto_path

                    })

                    .eq(
                        "id",
                        photo.album_id
                    );

            } else {

                await supabaseClient

                    .from("albums")

                    .update({

                        cover_url:
                            null,

                        cover_path:
                            null

                    })

                    .eq(
                        "id",
                        photo.album_id
                    );

            }

        }


        /*
            Refresh
        */

        await loadTimeline();

        await openAlbum(
            photo.album_id
        );


    } catch (error) {

        console.error(error);

        alert(
            "Foto gagal dihapus: " +
            error.message
        );

    }

}


/* =========================================================
   HAPUS ALBUM
========================================================= */

async function hapusAlbum(
    albumId
) {

    const yakin =
        confirm(
            "Yakin ingin menghapus seluruh album beserta semua fotonya?"
        );


    if (!yakin) {
        return;
    }


    /*
        Cek login
    */

    const {
        data: userData
    } =
        await supabaseClient.auth
            .getUser();


    if (!userData.user) {

        alert(
            "Silakan login sebagai admin."
        );

        return;

    }


    try {

        /*
            Ambil semua foto album
        */

        const {
            data: photos,
            error: photoError
        } =
            await supabaseClient

                .from(
                    "album_photos"
                )

                .select(
                    "id, foto_path"
                )

                .eq(
                    "album_id",
                    albumId
                );


        if (photoError) {

            throw photoError;

        }


        /*
            Ambil path foto
        */

        const paths =
            (photos || [])
                .map(
                    photo =>
                        photo.foto_path
                )
                .filter(Boolean);


        /*
            Hapus Storage
        */

        if (paths.length) {

            const {
                error: storageError
            } =
                await supabaseClient.storage

                    .from(
                        STORAGE_BUCKET
                    )

                    .remove(
                        paths
                    );


            if (storageError) {

                throw storageError;

            }

        }


        /*
            Hapus foto database
        */

        const {
            error: deletePhotosError
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


        if (deletePhotosError) {

            throw deletePhotosError;

        }


        /*
            Hapus album
        */

        const {
            error: deleteAlbumError
        } =
            await supabaseClient

                .from("albums")

                .delete()

                .eq(
                    "id",
                    albumId
                );


        if (deleteAlbumError) {

            throw deleteAlbumError;

        }


        /*
            Refresh
        */

        await loadTimeline();


        alert(
            "Album berhasil dihapus ❤️"
        );


    } catch (error) {

        console.error(error);

        alert(
            "Album gagal dihapus: " +
            error.message
        );

    }

}


/* =========================================================
   SCROLL GALERI
========================================================= */

function scrollToGallery() {

    if (!timelineList) {
        return;
    }


    timelineList.scrollIntoView({

        behavior: "smooth",

        block: "center"

    });

}


/* =========================================================
   AUTH STATE
========================================================= */

supabaseClient.auth

    .onAuthStateChange(
        (
            event,
            session
        ) => {

            if (
                session &&
                session.user
            ) {

                updateAdminUI(
                    session.user
                );

            } else {

                updateAdminUI(
                    null
                );

            }

        }
    );


/* =========================================================
   ESC KEY
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Escape"
        ) {

            const viewer =
                document.getElementById(
                    "albumViewer"
                );


            if (viewer) {

                closeAlbum();

            }

        }

    }
);


/* =========================================================
   START WEBSITE
========================================================= */

checkLogin();

loadTimeline();