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
        guide: "Masukkan omzet harian. Biaya hanya untuk BBM eceran dan es batu. Gaji ABK = Rp0."
      },
      {
        name: "Menengah (2–10 Orang / Jaring & Bagan)",
        min: 40,
        max: 55,
        guide: "Masukkan biaya solar genset, lampu hias/penarik, dan perbekalan. Aktifkan formula bagi hasil lokal 50% Pemilik : 50% Sawi/ABK.",
        action: {
          label: "Aktifkan Mode Bagi Hasil Kru/Trip",
          type: "activate_bagi_hasil"
        }
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
        note: "Potong 10% untuk kas perawatan kapal sebelum profit bersih dibagi"
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
        guide: "Catat penjualan musiman (Idul Adha). Masukkan biaya obat/vitamin hewan. Biaya pakan = Rp0 jika digembalakan bebas di kebun kelapa Donggala."
      },
      {
        name: "Menengah (Kelompok Penggemukan/Fattening)",
        min: 40,
        max: 50,
        guide: "Masukkan modal pembelian bibit/bakalan sapi. Input pengeluaran pakan konsentrat pabrikan dan ampas tahu."
      },
      {
        name: "Atas (Kemitraan Ayam Broiler/Petelur Skala Besar)",
        min: 20,
        max: 30,
        guide: "Biaya pakan ternak pabrikan sangat mendominasi (hingga 70%). Input pengeluaran bibit DOC, vaksinasi ketat, listrik blower kandang, dan gaji berkala penjaga kandang."
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
        guide: "Catat pendapatan mingguan dari pasar tradisional. Biaya hanya untuk benih eceran dan pupuk kompos buatan sendiri."
      },
      {
        name: "Menengah (Cabai, Tomat, Bawang di Lahan Terbuka)",
        min: 40,
        max: 55,
        guide: "Masukkan biaya operasional per musim panen (mulsa plastik, pupuk kimia NPK, pestisida). Sisihkan parameter risiko gagal panen sebesar 10% dari proyeksi omzet."
      },
      {
        name: "Atas (Sentra Durian Montong/Tambun Donggala)",
        min: 30,
        max: 45,
        guide: "Catat omzet tahunan/musiman saat ditebas oleh pengepul besar. Input biaya perawatan pohon tahunan, hormon pembuahan, serta upah buruh petik harian."
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
        guide: "Efisiensi sangat tinggi karena kelapa tumbuh alami. Biaya operasional hanya dihitung saat menyewa pemanjat pohon atau membeli kayu bakar penjemuran kopra."
      },
      {
        name: "Menengah (Kebun Kakao/Cengkih Berkelompok)",
        min: 50,
        max: 60,
        guide: "Masukkan biaya obat penangkal hama penggerek buah kakao dan biaya buruh petik harian saat musim panen raya cengkih tiba."
      },
      {
        name: "Atas (Pengepul Besar & Pengolahan Minyak Kelapa)",
        min: 15,
        max: 25,
        guide: "Margin persentase kecil tetapi volume perputaran uang masif. Input biaya pembelian bahan baku mentah dari petani kecil, biaya penyusutan mesin kempa, dan ongkos angkut truk ke Pelabuhan Donggala/Palu."
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
        guide: "Masukkan sistem bagi hasil tanah jika lahan bukan milik pribadi (biasanya sistem maro/seperdua hasil). Biaya benih bantuan pemerintah sering kali Rp0."
      },
      {
        name: "Menengah/Atas (Sawah Irigasi Teknis & Alsintan)",
        min: 30,
        max: 40,
        guide: "Masukkan biaya variabel tinggi: sewa mesin combine harvester (pemanen), traktor pembajak, pembelian pupuk subsidi/non-subsidi, serta biaya penggilingan gabah (RMU)."
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
        guide: "Biaya operasional utama berupa logistik masuk ke hutan pedalaman Donggala dan transportasi rakit/truk ke hilir."
      },
      {
        name: "Atas (Hutan Tanaman Rakyat/Industri Kayu)",
        min: 25,
        max: 35,
        guide: "Investasi jangka panjang. Masukkan parameter Biaya Tetap pengurusan dokumen perizinan legalitas kayu (SVLK), biaya tebang, dan biaya penyusutan gergaji mesin (chainsaw)."
      }
    ]
  },
  perdagangan: {
    title: "Perdagangan (Kios Sembako, Toko Kelontong, Agen Ikan)",
    note: "Pemisahan Grosir vs Eceran (2 Formula)",
    levels: [
      {
        name: "Kecil (Kios Campuran Kelurahan/Eceran)",
        min: 20,
        max: 25,
        guide: "Masukkan modal belanja barang harian ke pasar induk Palu (HPP). Keuntungan diambil dari margin harga jual eceran."
      },
      {
        name: "Atas (Agen Besar/Grosir Penyuplai)",
        min: 5,
        max: 10,
        guide: "Gunakan formula grosir. Margin per produk sangat tipis (mis. Rp500–Rp1.000/barang), tapi aplikasi harus menghitung berdasarkan volume penjualan kuantitas besar (kartonan/bal)."
      }
    ]
  },
  'industri-pengolahan': {
    title: "Industri Pengolahan (Abon Ikan, Keripik, Pengasapan Ikan)",
    note: "Maklon/Jasa Olah vs Produksi Mandiri (2 Formula)",
    levels: [
      {
        name: "Kecil (Industri Rumah Tangga/UMKM Abon Ikan Donggala)",
        min: 40,
        max: 50,
        guide: "Masukkan biaya bahan baku ikan segar dari PPI, minyak goreng, bumbu dapur, dan kemasan standing pouch."
      },
      {
        name: "Atas (Pabrik Pengolahan Es Balok/Pengalengan Skala Industri)",
        min: 20,
        max: 30,
        guide: "Masukkan biaya beban listrik PLN tarif industri yang tinggi, penyusutan mesin pendingin skala besar, komponen legalitas BPOM/Halal, dan upah buruh pabrik sesuai UMK."
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
        guide: "Input perputaran kas harian. Biaya bahan baku makanan segar dibeli subuh hari. Sisa makanan tidak terjual dihitung sebagai kerugian variabel harian (0% value)."
      },
      {
        name: "Menengah/Atas (Cottage Wisata/Penginapan Tanjung Karang Donggala)",
        min: 35,
        max: 45,
        guide: "Masukkan biaya perawatan bangunan pantai (korosi air laut tinggi), tagihan listrik AC, laundry sprei, komisi aplikasi booking online, dan gaji staf kebersihan/resepsionis."
      }
    ]
  }
};
