"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { kosService } from "@/lib/services/kosService";
import { GalleryPhoto } from "@/types/database";
import {
  Camera,
  Plus,
  Trash2,
  X,
  Maximize2,
  Upload,
  Link as LinkIcon,
  ShieldCheck,
  CheckCircle,
  Image as ImageIcon,
} from "lucide-react";

export default function KosGallery() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminName, setAdminName] = useState("");

  // Lightbox Modal state
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);

  // Add Photo Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [titleInput, setTitleInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("Kamar");
  const [urlInput, setUrlInput] = useState("");
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    // Check Admin status
    if (typeof window !== "undefined") {
      const authData = localStorage.getItem("kos_auth_user");
      if (authData) {
        try {
          const user = JSON.parse(authData);
          if (user.role === "admin") {
            setIsAdmin(true);
            setAdminName(user.name || "Admin");
          }
        } catch {}
      }
    }
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    setLoading(true);
    try {
      const data = await kosService.getGalleryPhotos();
      setPhotos(data || []);
    } catch (err) {
      console.error("Failed to load gallery photos", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran berkas maksimal 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const photoUrl = uploadMode === "file" ? filePreview : urlInput.trim();

    if (!photoUrl) {
      alert("Silakan unggah berkas foto atau masukkan link URL foto terlebih dahulu.");
      return;
    }

    setSubmitting(true);
    try {
      await kosService.addGalleryPhoto({
        title: "Foto Kos",
        url: photoUrl,
        category: "Kos",
      });

      setSuccessMsg("Foto berhasil ditambahkan!");
      await loadPhotos();

      setTimeout(() => {
        setIsAddModalOpen(false);
        setSuccessMsg("");
        setTitleInput("");
        setUrlInput("");
        setFilePreview(null);
        setSubmitting(false);
      }, 600);
    } catch (err) {
      console.error("Failed to add photo", err);
      alert("Gagal menambahkan foto");
      setSubmitting(false);
    }
  };

  const handleDeletePhoto = async (photoId: string, title: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus foto "${title}"?`)) {
      try {
        await kosService.deleteGalleryPhoto(photoId);
        await loadPhotos();
      } catch (err) {
        console.error("Failed to delete photo", err);
      }
    }
  };

  return (
    <section className="bg-latte rounded-3xl p-5 border border-cocoa/15 shadow-card space-y-4">
      {/* Header & Admin Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cocoa/10 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-caramel/20 text-coffee rounded-xl">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-cocoa uppercase tracking-wider block">
                Galeri Kos
              </span>
              <h2 className="font-serif font-bold text-base text-espresso">
                Galeri Foto Kos
              </h2>
            </div>
          </div>
        </div>

        {/* Admin Action Button & Swipe Hint */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {photos.length > 1 && (
            <span className="text-[10px] bg-caramel/20 text-coffee px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
              Geser foto →
            </span>
          )}
          {isAdmin && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-caramel hover:bg-caramel-dark text-espresso font-bold rounded-2xl text-xs shadow-xs active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Foto</span>
            </button>
          )}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="flex gap-3 overflow-x-auto pb-2 pt-1">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="w-36 sm:w-44 aspect-square shrink-0 bg-cream rounded-2xl animate-pulse border border-cocoa/10"
            />
          ))}
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-10 bg-cream/50 rounded-2xl border border-cocoa/15 space-y-2">
          <ImageIcon className="w-8 h-8 text-cocoa/50 mx-auto" />
          <p className="text-xs text-cocoa font-medium">Belum ada foto di galeri kos.</p>
          {isAdmin && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-coffee text-white rounded-xl text-xs font-bold mt-2"
            >
              <Plus className="w-3.5 h-3.5" /> Unggah Foto Pertama
            </button>
          )}
        </div>
      ) : (
        /* Swipeable Photo Container (Support > 4 photos with smooth touch swipe & scroll) */
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 pt-1 no-scrollbar">
          {photos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className="group relative w-36 sm:w-44 aspect-square shrink-0 snap-start rounded-2xl overflow-hidden border border-cocoa/15 bg-cream shadow-card cursor-pointer active:scale-[0.98] transition-all"
            >
              {/* Pure Image */}
              <img
                src={photo.url}
                alt={photo.title || "Foto Kos"}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Hover Overlay Zoom Icon */}
              <div className="absolute inset-0 bg-espresso/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <div className="p-2 bg-espresso/60 text-white rounded-2xl backdrop-blur-xs">
                  <Maximize2 className="w-4 h-4" />
                </div>
              </div>

              {/* Delete Button for Admin */}
              {isAdmin && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePhoto(photo.id, photo.title || "Foto Kos");
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-status-danger text-white rounded-xl shadow-md hover:bg-status-danger/90 active:scale-95 transition-all z-10"
                  title="Hapus Foto (Admin Only)"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal 1: Lightbox / Fullscreen Preview */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso/80 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-2xl w-full bg-latte rounded-3xl border border-cocoa/20 shadow-2xl overflow-hidden space-y-3 p-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-cocoa/15 pb-2">
              <h3 className="font-serif font-bold text-base text-espresso">
                Foto Kos
              </h3>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="p-1.5 bg-cream hover:bg-cocoa/15 text-espresso rounded-xl transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Photo Container */}
            <div className="relative rounded-2xl overflow-hidden bg-espresso/10 flex items-center justify-center max-h-[70vh]">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.title}
                className="w-full h-auto max-h-[65vh] object-contain rounded-2xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Admin Add Photo Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative max-w-md w-full bg-latte rounded-3xl border border-cocoa/20 shadow-2xl p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-cocoa/15 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-caramel/20 text-coffee rounded-xl">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-espresso">
                    Tambah Foto Kos Baru
                  </h3>
                  <p className="text-cocoa text-xs">Khusus Admin Pemilik Kos</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setFilePreview(null);
                }}
                className="p-1.5 bg-cream text-espresso hover:bg-cocoa/15 rounded-xl transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddPhotoSubmit} className="space-y-3.5">
              {/* Choice of Upload Mode */}
              <div className="grid grid-cols-2 gap-1 bg-cream p-1 rounded-2xl border border-cocoa/15">
                <button
                  type="button"
                  onClick={() => setUploadMode("file")}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    uploadMode === "file"
                      ? "bg-coffee text-white shadow-xs"
                      : "text-espresso/70 hover:text-espresso"
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  Unggah Berkas
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode("url")}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    uploadMode === "url"
                      ? "bg-coffee text-white shadow-xs"
                      : "text-espresso/70 hover:text-espresso"
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  Link URL Foto
                </button>
              </div>

              {/* Upload Input File or URL */}
              {uploadMode === "file" ? (
                <div>
                  <label className="block text-xs font-semibold text-espresso mb-1">
                    Pilih File Berkas Foto (HP / Laptop)
                  </label>
                  <div className="border-2 border-dashed border-cocoa/30 rounded-2xl p-4 text-center bg-cream/50 hover:bg-cream transition-colors cursor-pointer relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    {filePreview ? (
                      <div className="space-y-2">
                        <img
                          src={filePreview}
                          alt="Preview"
                          className="h-28 mx-auto object-cover rounded-xl border border-cocoa/20"
                        />
                        <span className="text-[11px] text-coffee font-bold block">
                          Ketuk untuk mengganti foto
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-1.5 text-cocoa">
                        <Upload className="w-6 h-6 mx-auto text-coffee" />
                        <p className="text-xs font-semibold text-espresso">
                          Klik untuk pilih foto dari galeri
                        </p>
                        <p className="text-[10px]">Format JPG, PNG, WEBP (Max 5MB)</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-espresso mb-1">
                    Link URL Foto
                  </label>
                  <input
                    type="url"
                    required={uploadMode === "url"}
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://contoh.com/foto-kamar.jpg"
                    className="w-full px-3.5 py-2 bg-cream rounded-2xl border border-cocoa/20 text-xs text-espresso focus:outline-none focus:border-coffee"
                  />
                </div>
              )}

              {successMsg && (
                <div className="flex items-center gap-2 p-2.5 bg-status-success/15 text-status-success rounded-2xl text-xs font-semibold">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 bg-coffee hover:bg-coffee-dark text-white font-bold rounded-2xl shadow-xs transition-all text-xs active:scale-95 disabled:opacity-50"
              >
                {submitting ? "Menyimpan Foto..." : "Simpan Foto ke Galeri"}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
