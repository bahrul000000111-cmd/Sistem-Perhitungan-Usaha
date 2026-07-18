/**
 * koefisienGuideData.js
 * Master Guide for Revenue Coefficients & Parameter Inputs (Donggala).
 * Mapped to the sector/sub-sector keys from the taxonomy.
 */

export const KOEFISIEN_GUIDE_DATA = {
  perikanan: {
    title: "Perikanan (Tangkap & Budidaya)",
    levels: [
      {
        name: "Kecil (1 Orang / Pancing Ulur)",
        min: 65,
        max: 75,
        guide: "Masukkan omzet harian. Biaya hanya untuk BBM eceran dan es batu. Gaji ABK = Rp0.",
        alasan: "Biaya operasional sangat minim (cuma BBM eceran & es batu) karena tidak ada upah kru yang harus dibayar — pemilik = pekerja itu sendiri, sehingga porsi pendapatan yang \"tersisa\" sebagai basis kalkulasi bisa tinggi (65-75%)."
      },
      {
        name: "Menengah (2–10 Orang / Jaring & Bagan)",
        min: 40,
        max: 55,
        guide: "Masukkan biaya solar genset, lampu hias/penarik, dan perbekalan. Aktifkan formula bagi hasil lokal 50% Pemilik : 50% Sawi/ABK.",
        action: {
          label: "Aktifkan Mode Bagi Hasil Kru/Trip",
          type: "activate_bagi_hasil"
        },
        alasan: "Bukan lagi soal margin %, tapi pembagian hasil — karena upah kru dibayar dari SHU (bukan gaji tetap), semakin besar kapal semakin besar kru & biaya trip (solar, ransum), sehingga bagian yang jadi hak pemilik makin ditentukan oleh efisiensi trip, bukan persentase tetap."
      },
      {
        name: "Atas (Industri / Pajeko / >10 Orang)",
        min: 30,
        max: 40,
        guide: "Gunakan Custom Formula (Indikator Ungu). Masukkan biaya solar industri massal. Potong 10% untuk kas perawatan kapal sebelum profit bersih dibagi menggunakan sistem kelembagaan Punggawa-Sawi.",
        action: {
          label: "Aktifkan Mode Bagi Hasil Kru/Trip",
          type: "activate_bagi_hasil"
        },
        note: "Potong 10% untuk kas perawatan kapal sebelum profit bersih dibagi",
        alasan: "Bukan lagi soal margin %, tapi pembagian hasil — karena upah kru dibayar dari SHU (bukan gaji tetap), semakin besar kapal semakin besar kru & biaya trip (solar, ransum), sehingga bagian yang jadi hak pemilik makin ditentukan oleh efisiensi trip, bukan persentase tetap."
      }
    ]
  },
  peternakan: {
    title: "Peternakan",
    levels: [
      {
        name: "Kecil (1–3 Ekor Sapi/Kambing Mandiri)",
        min: 60,
        max: 70,
        guide: "Catat penjualan musiman (Idul Adha). Masukkan biaya obat/vitamin hewan. Biaya pakan = Rp0 jika digembalakan bebas di kebun kelapa Donggala.",
        alasan: "Biaya pakan sering Rp0 (digembalakan bebas) sehingga hampir seluruh hasil penjualan adalah \"untung\", koefisien bisa tinggi (60-70%)."
      },
      {
        name: "Menengah (Kelompok Penggemukan/Fattening)",
        min: 40,
        max: 50,
        guide: "Masukkan modal pembelian bibit/bakalan sapi. Input pengeluaran pakan konsentrat pabrikan dan ampas tahu.",
        alasan: "Mulai ada biaya nyata (bibit/bakalan, pakan konsentrat pabrikan) yang mengurangi porsi bersih, koefisien turun ke 40-50%."
      },
      {
        name: "Atas (Kemitraan Ayam Broiler/Petelur Skala Besar)",
        min: 20,
        max: 30,
        guide: "Biaya pakan ternak pabrikan sangat mendominasi (hingga 70%). Input pengeluaran bibit DOC, vaksinasi ketat, listrik blower kandang, dan gaji berkala penjaga kandang.",
        alasan: "Biaya pakan pabrikan mendominasi (bisa 70% dari omzet) karena skala industri butuh pakan berkualitas terus-menerus — koefisien jadi paling rendah di sektor ini (20-30%)."
      }
    ]
  },
  hortikultura: {
    title: "Hortikultura (Sayur & Buah Premium)",
    levels: [
      {
        name: "Kecil (Sayuran Pekarangan Swadaya)",
        min: 60,
        max: 70,
        guide: "Catat pendapatan mingguan dari pasar tradisional. Biaya hanya untuk benih eceran dan pupuk kompos buatan sendiri.",
        alasan: "Modal awal kecil (benih eceran, kompos sendiri), risiko rendah karena sikuan tanam pendek — koefisien tinggi (60-70%)."
      },
      {
        name: "Menengah (Cabai, Tomat, Bawang di Lahan Terbuka)",
        min: 40,
        max: 55,
        guide: "Masukkan biaya operasional per musim panen (mulsa plastik, pupuk kimia NPK, pestisida). Sisihkan parameter risiko gagal panen sebesar 10% dari proyeksi omzet.",
        alasan: "Butuh input kimia (pupuk NPK, pestisida) & mulsa plastik yang harus dibeli rutin per musim, plus risiko gagal panen nyata — koefisien turun & perlu buffer risiko (40-55%)."
      },
      {
        name: "Atas (Sentra Durian Montong/Tambun Donggala)",
        min: 30,
        max: 45,
        guide: "Catat omzet tahunan/musiman saat ditebas oleh pengepul besar. Input biaya perawatan pohon tahunan, hormon pembuahan, serta upah buruh petik harian.",
        alasan: "Meski harga jual tinggi, ada biaya perawatan tahunan & hormon pembuahan yang harus dikeluarkan terus meski panen musiman — koefisien menengah (30-45%)."
      }
    ]
  },
  perkebunan: {
    title: "Perkebunan (Kelapa/Kopra, Kakao, Cengkih)",
    levels: [
      {
        name: "Kecil (Kebun Kelapa Mandiri)",
        min: 70,
        max: 80,
        guide: "Efisiensi sangat tinggi karena kelapa tumbuh alami. Biaya operasional hanya dihitung saat menyewa pemanjat pohon atau membeli kayu bakar penjemuran kopra.",
        alasan: "Kelapa nyaris tanpa perawatan intensif (tumbuh alami), biaya cuma insidental (pemanjat pohon/kayu bakar) — koefisien tertinggi di sektor pertanian (70-80%)."
      },
      {
        name: "Menengah (Kebun Kakao/Cengkih Berkelompok)",
        min: 50,
        max: 60,
        guide: "Masukkan biaya obat penangkal hama penggerek buah kakao dan biaya buruh petik harian saat musim panen raya cengkih tiba.",
        alasan: "Butuh penanganan hama aktif & upah buruh petik musiman yang nyata mengurangi hasil bersih — koefisien menengah (50-60%)."
      },
      {
        name: "Atas (Pengepul Besar & Pengolahan Minyak Kelapa)",
        min: 15,
        max: 25,
        guide: "Margin persentase kecil tetapi volume perputaran uang masif. Input biaya pembelian bahan baku mentah dari petani kecil, biaya penyusutan mesin kempa, dan ongkos angkut truk ke Pelabuhan Donggala/Palu.",
        alasan: "Bisnis berbasis volume, bukan margin — beli murah dari petani kecil lalu jual dengan markup tipis per unit tapi kuantitas besar, sehingga koefisien harus rendah (15-25%) supaya hasil akhir tidak overstated."
      }
    ]
  },
  pangan: {
    title: "Pangan (Padi Sawah & Jagung)",
    levels: [
      {
        name: "Kecil (Petani Penggarap Tradisional)",
        min: 45,
        max: 55,
        guide: "Masukkan sistem bagi hasil tanah jika lahan bukan milik pribadi (biasanya sistem maro/seperdua hasil). Biaya benih bantuan pemerintah sering kali Rp0.",
        alasan: "Setengah hasil sudah otomatis jadi hak pemilik lahan (sistem bagi hasil tanah) sebelum dihitung sebagai pendapatan usaha — koefisien menengah (45-55%) TAPI harus dikurangi manual dulu porsi pemilik lahan sebelum diinput."
      },
      {
        name: "Menengah/Atas (Sawah Irigasi Teknis & Alsintan)",
        min: 30,
        max: 40,
        guide: "Masukkan biaya variabel tinggi: sewa mesin combine harvester (pemanen), traktor pembajak, pembelian pupuk subsidi/non-subsidi, serta biaya penggilingan gabah (RMU).",
        alasan: "Sewa alat berat (combine harvester, traktor) & pupuk non-subsidi jadi biaya nyata yang signifikan — koefisien lebih rendah (30-40%) dibanding petani tradisional."
      }
    ]
  },
  kehutanan: {
    title: "Kehutanan (Kayu Sengon, Rotan, Gaharu)",
    levels: [
      {
        name: "Kecil/Menengah (Pencari Rotan Alam/Pembibitan Pohon)",
        min: 55,
        max: 65,
        guide: "Biaya operasional utama berupa logistik masuk ke hutan pedalaman Donggala dan transportasi rakit/truk ke hilir.",
        alasan: "Biaya utama cuma logistik masuk-keluar hutan, tidak ada biaya produksi/bahan baku beli — koefisien cukup tinggi (55-65%)."
      },
      {
        name: "Atas (Hutan Tanaman Rakyat/Industri Kayu)",
        min: 25,
        max: 35,
        guide: "Investasi jangka panjang. Masukkan parameter Biaya Tetap pengurusan dokumen perizinan legalitas kayu (SVLK), biaya tebang, dan biaya penyusutan gergaji mesin (chainsaw).",
        alasan: "Investasi jangka panjang: legalitas (SVLK), biaya tebang, penyusutan alat berat (chainsaw) — koefisien rendah (25-35%) karena biaya tetap besar relatif terhadap hasil per siklus."
      }
    ]
  },
  perdagangan: {
    title: "Perdagangan (Kios Sembako, Toko Kelontong, Agen Ikan)",
    note: "Skala Kios/Toko (Kecil/Menengah/Besar)",
    isRestructuredTrade: true,
    levels: [
      {
        name: "Kios/Toko Kecil",
        min: 20,
        max: 25,
        guide: "Omzet kotor < Rp1 juta/hari, dijaga sendiri (1 orang), kulakan eceran ke pasar terdekat, rak/etalase terbatas. Masuk ke formula kios_campuran (M1), frekuensi Pendapatan Kotor = per Hari.",
        alasan: "Skala kecil biasanya jual barang campuran dengan margin eceran yang relatif lebar per item (karena beli sedikit-sedikit, tapi mark-up per barang cukup tinggi untuk menutup biaya operasional harian)."
      },
      {
        name: "Kios/Toko Menengah",
        min: 12,
        max: 18,
        guide: "Omzet kotor Rp1–5 juta/hari, 1–3 karyawan, variasi produk lebih banyak, mulai ada kulakan semi-grosir (per dus/karton). Masuk ke formula kios_campuran (M1), frekuensi = per Hari.",
        alasan: "Kompetisi harga lebih ketat pada skala ini (banyak toko sejenis di sekitar), margin per barang ditekan, tapi dikompensasi volume penjualan yang lebih tinggi."
      },
      {
        name: "Toko/Grosir Besar",
        min: 5,
        max: 10,
        guide: "Omzet kotor > Rp5 juta/hari, >3 karyawan, kulakan langsung dari distributor/pabrik (kartonan/bal), melayani penjualan ke kios-kios kecil lain. Masuk ke formula kios_campuran (M1), frekuensi = per Hari, atau tempurung-style batch jika benar-benar berbasis volume/berat barang curah.",
        alasan: "Margin per unit sangat tipis (Rp500–Rp1.000/barang) karena bersaing di level grosir, tapi keuntungan didapat dari volume kuantitas besar, bukan margin tinggi per item."
      }
    ]
  },
  'industri-pengolahan': {
    title: "Industri Pengolahan (Abon Ikan, Keripik, Pengasapan Ikan)",
    levels: [
      {
        name: "Kecil (Industri Rumah Tangga/UMKM Abon Ikan Donggala)",
        min: 40,
        max: 50,
        guide: "Masukkan biaya bahan baku ikan segar dari PPI, minyak goreng, bumbu dapur, dan kemasan standing pouch.",
        alasan: "Bahan baku (ikan segar, minyak goreng, bumbu, kemasan) adalah komponen biaya dominan pada skala kecil — koefisien menengah (40-50%), TAPI belum ada formula dedicated (lihat peringatan Addendum #22 Bagian 2.8)."
      },
      {
        name: "Atas (Pabrik Pengolahan Es Balok/Pengalengan Skala Industri)",
        min: 20,
        max: 30,
        guide: "Masukkan biaya beban listrik PLN tarif industri yang tinggi, penyusutan mesin pendingin skala besar, komponen legalitas BPOM/Halal, dan upah buruh pabrik sesuai UMK.",
        alasan: "Beban listrik industri, penyusutan mesin, dan kepatuhan legalitas (BPOM/Halal) jadi biaya tetap besar — koefisien rendah (20-30%)."
      }
    ]
  },
  'akomodasi-makan-minum': {
    title: "Penyediaan Akomodasi & Makan Minum (Warung Makan, Penginapan Pesisir)",
    levels: [
      {
        name: "Kecil (Warung Makan/Lapak Ikan Bakar Pesisir)",
        min: 45,
        max: 55,
        guide: "Input perputaran kas harian. Biaya bahan baku makanan segar dibeli subuh hari. Sisa makanan tidak terjual dihitung sebagai kerugian variabel harian (0% value).",
        alasan: "Bahan baku segar dibeli harian dengan harga pasar fluktuatif, plus risiko makanan tak terjual — koefisien menengah-tinggi (45-55%) untuk mengakomodasi margin jual-masak yang relatif lebar dibanding usaha dagang murni."
      },
      {
        name: "Menengah/Atas (Cottage Wisata/Penginapan Tanjung Karang Donggala)",
        min: 35,
        max: 45,
        guide: "Masukkan biaya perawatan bangunan pantai (korosi air laut tinggi), tagihan listrik AC, laundry sprei, komisi aplikasi booking online, dan gaji staf kebersihan/resepsionis.",
        alasan: "Biaya perawatan aset fisik (korosi air laut, AC, laundry) & komisi platform booking online mengurangi signifikan dari tarif kamar — koefisien lebih rendah (35-45%)."
      }
    ]
  },
  jasa: {
    title: "Jasa",
    levels: [
      {
        name: "Jasa Reparasi & Teknis",
        min: 25,
        max: 40,
        guide: "Bengkel motor/mobil, servis elektronik, tukang las. Menggunakan formula Kalkulasi Generik Harian (generik_harian).",
        alasan: "Ada biaya sparepart/bahan yang dibeli untuk servis (kadang ditalangi dulu oleh bengkel), jadi bukan murni jasa tenaga — porsi materialnya mengurangi basis pendapatan."
      },
      {
        name: "Jasa Personal & Kebersihan",
        min: 45,
        max: 60,
        guide: "Salon/pangkas rambut, laundry, jasa kebersihan rumah. Menggunakan formula Kalkulasi Generik Harian (generik_harian).",
        alasan: "Biaya bahan minim (sabun, sampo, deterjen relatif murah dibanding harga jasa), sebagian besar nilai jual adalah tenaga/keahlian — mendekati kategori \"pekerjaan bebas\" NPPN yang biasa bernorma tinggi (~50%)."
      },
      {
        name: "Jasa Transportasi & Angkutan",
        min: 20,
        max: 35,
        guide: "Ojek, angkutan hasil bumi/barang, rental kendaraan. Menggunakan formula Kalkulasi Generik Harian (generik_harian).",
        alasan: "BBM & perawatan kendaraan (ban, oli, servis rutin) adalah biaya operasional signifikan yang berbanding lurus dengan jarak tempuh/frekuensi trip."
      },
      {
        name: "Jasa Konstruksi & Pertukangan",
        min: 20,
        max: 35,
        guide: "Tukang bangunan, kontraktor kecil, jasa renovasi. Menggunakan formula Kalkulasi Generik Harian (generik_harian).",
        alasan: "Sebagian proyek melibatkan pembelian material (semen, kayu, cat) yang ditalangi tukang/kontraktor sebelum ditagih ke pelanggan — porsi material mengurangi basis pendapatan jasa murni."
      },
      {
        name: "Jasa Profesional/Keahlian Khusus",
        min: 45,
        max: 55,
        guide: "Fotografi, les privat, jasa desain, konsultasi kecil. Menggunakan formula Kalkulasi Generik Harian (generik_harian).",
        alasan: "Sesuai pola NPPN untuk \"pekerjaan bebas\" (fotografi, konsultan, dll. bernorma ~50% di banyak KLU) — biaya operasional minim karena modal utama adalah keahlian personal, bukan barang/bahan."
      }
    ]
  }
};
