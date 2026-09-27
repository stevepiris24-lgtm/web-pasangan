/* =====================================================
   SUPABASE CONFIGURATION
===================================================== */

/*
    GANTI 2 BAGIAN INI

    SUPABASE_URL:
    ambil dari Supabase Project Settings > API

    SUPABASE_KEY:
    gunakan Publishable key / client key
*/

const SUPABASE_URL =
    "https://zfuufjwkgttrywcfmwsn.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_ozpU_wRFramJNDT5q-oIgw_BY_Iceub";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =====================================================
   HUBUNGAN
===================================================== */

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


function changeText() {

    const el =
        document.getElementById("dynamicText");

    if (!el) return;


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


/* =====================================================
   TIMER
===================================================== */

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


/* =====================================================
   ELEMENT
===================================================== */

const timelineList =
    document.getElementById("timelineList");


const addForm =
    document.getElementById("addForm");


const loginBox =
    document.getElementById("loginBox");


const adminPanel =
    document.getElementById("adminPanel");


/* =====================================================
   ESCAPE HTML
   Mencegah teks user merusak HTML
===================================================== */

function escapeHTML(value) {

    if (value === null ||
        value === undefined) {

        return "";

    }


    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


/* =====================================================
   FORMAT TANGGAL
===================================================== */

function formatTanggal(tanggal) {

    if (!tanggal) return "";


    const date =
        new Date(
            `${tanggal}T00:00:00`
        );


    return date.toLocaleDateString(
        "id-ID",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* =====================================================
   LOAD TIMELINE
===================================================== */

async function loadTimeline() {

    timelineList.innerHTML = `

        <div class="loading">

            Memuat cerita kita... ❤️

        </div>

    `;


    const {
        data,
        error
    } = await supabaseClient

        .from("timeline")

        .select("*")

        .order(
            "tanggal",
            {
                ascending: true
            }
        );


    if (error) {

        console.error(error);

        timelineList.innerHTML = `

            <div class="empty-state">

                <strong>
                    Gagal memuat timeline
                </strong>

                <span>
                    ${escapeHTML(error.message)}
                </span>

            </div>

        `;

        return;

    }


    renderTimeline(data || []);

}


/* =====================================================
   RENDER TIMELINE
===================================================== */

function renderTimeline(data) {

    if (!data.length) {

        timelineList.innerHTML = `

            <div class="empty-state">

                <strong>
                    Belum ada kenangan ❤️
                </strong>

                <span>
                    Login sebagai admin untuk menambahkan cerita pertama.
                </span>

            </div>

        `;

        return;

    }


    timelineList.innerHTML = "";


    data.forEach(item => {

        const card =
            document.createElement("article");


        card.className =
            "timeline-card";


        let photoHTML = "";


        if (item.foto_url) {

            photoHTML = `

                <img
                    class="timeline-photo"
                    src="${escapeHTML(item.foto_url)}"
                    alt="${escapeHTML(item.judul)}"
                    loading="lazy"
                >

            `;

        } else {

            photoHTML = `

                <div
                    class="timeline-photo"
                    style="
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        color:#777;
                        font-size:12px;
                    "
                >

                    ❤️

                </div>

            `;

        }


        card.innerHTML = `

            ${photoHTML}


            <button
                class="delete-card-btn"
                onclick="hapusKenangan(${item.id})"
                title="Hapus kenangan">

                ×

            </button>


            <div class="timeline-content">

                <div class="timeline-date">

                    ${formatTanggal(item.tanggal)}

                </div>


                <h3>

                    ${escapeHTML(item.judul)}

                </h3>


                ${
                    item.lokasi
                    ?
                    `
                    <div class="timeline-location">

                        📍 ${escapeHTML(item.lokasi)}

                    </div>
                    `
                    :
                    ""
                }


                <p class="timeline-story">

                    ${escapeHTML(item.cerita)}

                </p>


                <div class="timeline-heart">

                    ♥
                    
                </div>

            </div>

        `;


        timelineList.appendChild(card);

    });

}


/* =====================================================
   OPEN / CLOSE ADD FORM
===================================================== */

function openAddForm() {

    supabaseClient.auth
        .getUser()
        .then(({ data }) => {

            if (!data.user) {

                loginBox.classList.add("show");

                loginBox.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

                showLoginMessage(
                    "Login admin terlebih dahulu."
                );

                return;

            }


            addForm.classList.add("show");


            addForm.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        });

}


function closeAddForm() {

    addForm.classList.remove("show");

}


/* =====================================================
   LOGIN ADMIN
===================================================== */

async function loginAdmin() {

    const email =
        document
            .getElementById("adminEmail")
            .value
            .trim();


    const password =
        document
            .getElementById("adminPassword")
            .value;


    if (!email ||
        !password) {

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

                email: email,

                password: password

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
        .getElementById("adminPassword")
        .value = "";

}


function showLoginMessage(message) {

    const el =
        document.getElementById(
            "loginMessage"
        );


    if (el) {

        el.innerText =
            message;

    }

}


/* =====================================================
   LOGOUT
===================================================== */

async function logoutAdmin() {

    await supabaseClient.auth.signOut();

    addForm.classList.remove("show");

    updateAdminUI(null);

}


/* =====================================================
   ADMIN UI
===================================================== */

function updateAdminUI(user) {

    if (user) {

        loginBox.classList.remove("show");

        adminPanel.classList.add("show");

        document
            .getElementById(
                "adminEmailText"
            )
            .innerText =
            user.email || "";


        document.body.classList.add(
            "admin-active"
        );

    } else {

        adminPanel.classList.remove("show");

        document.body.classList.remove(
            "admin-active"
        );

    }

}


/* =====================================================
   CEK LOGIN SAAT WEBSITE DIBUKA
===================================================== */

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

        updateAdminUI(null);

    }

}


/* =====================================================
   TAMBAH KENANGAN
===================================================== */

async function tambahKenangan() {

    const judul =
        document
            .getElementById("judul")
            .value
            .trim();


    const tanggal =
        document
            .getElementById("tanggal")
            .value;


    const lokasi =
        document
            .getElementById("lokasi")
            .value
            .trim();


    const cerita =
        document
            .getElementById("cerita")
            .value
            .trim();


    const fileInput =
        document
            .getElementById("foto");


    const file =
        fileInput.files[0];


    const message =
        document
            .getElementById(
                "formMessage"
            );


    /* =====================================
       VALIDASI
    ===================================== */

    if (!judul ||
        !tanggal ||
        !cerita) {

        message.innerText =
            "Judul, tanggal, dan cerita wajib diisi.";

        return;

    }


    if (!file) {

        message.innerText =
            "Pilih foto terlebih dahulu.";

        return;

    }


    if (!file.type.startsWith("image/")) {

        message.innerText =
            "File harus berupa gambar.";

        return;

    }


    /*
        Supabase merekomendasikan standard upload
        untuk file kecil sampai sekitar 6 MB.
    */

    if (file.size > 6 * 1024 * 1024) {

        message.innerText =
            "Ukuran foto maksimal 6 MB.";

        return;

    }


    /* =====================================
       CEK LOGIN
    ===================================== */

    const {
        data: userData
    } =
        await supabaseClient.auth
            .getUser();


    if (!userData.user) {

        message.innerText =
            "Sesi admin sudah berakhir. Silakan login lagi.";

        return;

    }


    /* =====================================
       MULAI UPLOAD
    ===================================== */

    message.innerText =
        "Mengupload foto... ⏳";


    try {

        /*
            Buat nama file unik
        */

        const extension =
            file.name
                .split(".")
                .pop()
                .toLowerCase();


        const fileName =
            `${crypto.randomUUID()}.${extension}`;


        const filePath =
            `timeline/${fileName}`;


        /*
            Upload ke Supabase Storage
        */

        const {
            data: uploadData,
            error: uploadError
        } =
            await supabaseClient.storage

                .from("timeline")

                .upload(
                    filePath,
                    file,
                    {
                        cacheControl: "3600",
                        upsert: false,
                        contentType: file.type
                    }
                );


        if (uploadError) {

            throw uploadError;

        }


        /*
            Ambil URL publik
        */

        const {
            data: publicUrlData
        } =
            supabaseClient.storage

                .from("timeline")

                .getPublicUrl(
                    uploadData.path
                );


        const fotoUrl =
            publicUrlData.publicUrl;


        message.innerText =
            "Menyimpan cerita... ❤️";


        /*
            Simpan informasi ke database
        */

        const {
            error: insertError
        } =
            await supabaseClient

                .from("timeline")

                .insert({

                    judul: judul,

                    tanggal: tanggal,

                    lokasi: lokasi,

                    cerita: cerita,

                    foto_url: fotoUrl,

                    foto_path: uploadData.path

                });


        if (insertError) {

            /*
                Kalau database gagal,
                hapus foto yang sudah terupload
            */

            await supabaseClient.storage

                .from("timeline")

                .remove([
                    uploadData.path
                ]);


            throw insertError;

        }


        /* =====================================
           BERHASIL
        ===================================== */

        message.innerText =
            "Kenangan berhasil disimpan ❤️";


        /*
            Reset form
        */

        document
            .getElementById("judul")
            .value = "";


        document
            .getElementById("tanggal")
            .value = "";


        document
            .getElementById("lokasi")
            .value = "";


        document
            .getElementById("cerita")
            .value = "";


        fileInput.value = "";


        /*
            Refresh gallery
        */

        await loadTimeline();


        /*
            Tutup form setelah sedikit delay
        */

        setTimeout(() => {

            closeAddForm();

            message.innerText = "";

        }, 1000);


    } catch (error) {

        console.error(error);

        message.innerText =
            "Gagal menyimpan: " +
            error.message;

    }

}


/* =====================================================
   HAPUS KENANGAN
===================================================== */

async function hapusKenangan(id) {

    const yakin =
        confirm(
            "Yakin ingin menghapus kenangan ini?"
        );


    if (!yakin) return;


    /*
        Pastikan admin login
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


    /*
        Ambil data foto terlebih dahulu
    */

    const {
        data: item,
        error: findError
    } =
        await supabaseClient

            .from("timeline")

            .select("*")

            .eq("id", id)

            .single();


    if (findError) {

        alert(
            "Data tidak ditemukan."
        );

        return;

    }


    /*
        Hapus foto dari Storage
    */

    if (item.foto_path) {

        const {
            error: storageError
        } =
            await supabaseClient.storage

                .from("timeline")

                .remove([
                    item.foto_path
                ]);


        if (storageError) {

            console.error(
                storageError
            );

            alert(
                "Foto gagal dihapus dari Storage."
            );

            return;

        }

    }


    /*
        Hapus data database
    */

    const {
        error: deleteError
    } =
        await supabaseClient

            .from("timeline")

            .delete()

            .eq("id", id);


    if (deleteError) {

        alert(
            "Data gagal dihapus: " +
            deleteError.message
        );

        return;

    }


    /*
        Refresh
    */

    await loadTimeline();

}


/* =====================================================
   SCROLL GALERI
===================================================== */

function scrollToGallery() {

    timelineList.scrollIntoView({

        behavior: "smooth",

        block: "center"

    });

}


/* =====================================================
   AUTH STATE
===================================================== */

supabaseClient.auth
    .onAuthStateChange(
        (event, session) => {

            if (session?.user) {

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


/* =====================================================
   START WEBSITE
===================================================== */

checkLogin();

loadTimeline();