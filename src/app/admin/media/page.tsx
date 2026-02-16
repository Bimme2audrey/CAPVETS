"use client";

import { useEffect, useState } from "react";
import { API_ENDPOINTS } from "@/lib/api";

interface MediaItem {
  _id?: string;
  public_id?: string;
  url: string;
  type: string;
  description?: string;
}

export default function MediaManagerPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [description, setDescription] = useState("");

  const fetchMedia = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.MEDIA);
      const data = await res.json();
      if (data.result === "success") {
        setMedia(data.data || []);
        console.log("Fetched data: ", data.data);
      }
    } catch (err) {
      console.error("Error fetching media:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fileInput = form.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    if (!fileInput?.files?.length) return;

    setUploading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const formData = new FormData();
      formData.append("media", fileInput.files[0]);
      formData.append("description", description);

      const res = await fetch(API_ENDPOINTS.MEDIA, {
        method: "POST",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
        body: formData,
      });

      if (res.ok) {
        setDescription("");
        fileInput.value = "";
        fetchMedia();
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const refactoredPublicId = (id: string): string => {
    return id.split("/")[1];
  };

  const handleDelete = async (publicId: string) => {
    if (!confirm("Delete this media item?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      await fetch(`${API_ENDPOINTS.MEDIA}/${refactoredPublicId(publicId)}`, {
        method: "DELETE",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      fetchMedia();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Media Manager</h2>

      {/* Upload Form */}
      <form
        onSubmit={handleUpload}
        className="bg-white rounded-xl border border-gray-200 p-5 mb-6 flex flex-wrap gap-4 items-end"
      >
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            File
          </label>
          <input
            type="file"
            accept="image/*,video/*"
            className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Small chicken 1.5kg"
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-yellow-400 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={uploading}
          className="px-6 py-2.5 bg-green-700 text-yellow-400 rounded-lg font-semibold text-sm hover:bg-green-800 transition-colors disabled:bg-gray-300 disabled:text-gray-500 cursor-pointer"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>

      {/* Media Grid */}
      {loading ?
        <div className="text-center py-12 text-gray-500">Loading media...</div>
      : media.length === 0 ?
        <div className="text-center py-12 text-gray-500">
          No media items yet.
        </div>
      : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {media.map((item, index) => (
            <div
              key={item.public_id || index}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden group relative"
            >
              {item.type === "videos" ?
                <video controls className="w-full h-48 object-cover">
                  <source src={item.url} type="video/mp4" />
                </video>
              : <img
                  src={item.url}
                  alt={item.description || "Media"}
                  className="w-full h-48 object-cover"
                />
              }
              <div className="p-3">
                <p className="text-sm text-gray-600 truncate">
                  {item.description || "No description"}
                </p>
              </div>
              {item.public_id && (
                <button
                  onClick={() => handleDelete(item.public_id!)}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-sm font-bold hover:bg-red-600 cursor-pointer"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      }
    </div>
  );
}
