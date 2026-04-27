"use client";
import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  memo,
  lazy,
  Suspense,
} from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { Select, Input, Modal } from "antd";
import {
  PlusOutlined,
  UploadOutlined,
  DeleteOutlined,
  EyeOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import Breadcrumb from "@/components/common/Breadcrumb";
import { base_url } from "../../../uitils/base_url";

// Lazy load heavy below-fold components
const Newslatter = lazy(() => import("@/components/common/Newslatter"));
const Footer = lazy(() => import("@/components/footer/Footer"));

const { Option } = Select;

// ─── Memoized Sub-Components ─────────────────────────────────────────────

const LazyFooterSection = memo(() => (
  <Suspense
    fallback={
      <div className="w-full h-32 bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#295557] border-t-transparent rounded-full animate-spin" />
      </div>
    }
  >
    <Newslatter />
    <Footer />
  </Suspense>
));
LazyFooterSection.displayName = "LazyFooterSection";

const LoginRequiredView = memo(({ onLogin }) => (
  <>
    <Breadcrumb pagename="Add Post" pagetitle="Add Post" />
    <div className="w-full bg-white py-20">
      <div className="max-w-md mx-auto text-center bg-white border-2 border-[#295557] rounded-lg p-8">
        <div className="w-16 h-16 bg-[#295557] rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-[#295557] mb-4">
          Login Required
        </h3>
        <p className="text-gray-600 mb-6">
          Please login to create and publish posts.
        </p>
        <button
          onClick={onLogin}
          className="w-full bg-[#e8a355] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#295557] transition-colors duration-300"
        >
          Go to Login
        </button>
      </div>
    </div>
    <LazyFooterSection />
  </>
));
LoginRequiredView.displayName = "LoginRequiredView";

const TipsSection = memo(() => (
  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
    <h3 className="text-lg font-bold text-[#295557] mb-4">Writing Tips</h3>
    <div className="space-y-3 text-sm text-gray-600">
      {[
        "Write compelling titles that grab attention",
        "Use high-quality images for better engagement",
        "Keep your content clear and well-structured",
        "Proofread before publishing",
      ].map((tip, i) => (
        <div key={i} className="flex items-start space-x-3">
          <div className="w-2 h-2 bg-[#e8a355] rounded-full mt-2 flex-shrink-0" />
          <p>{tip}</p>
        </div>
      ))}
    </div>
  </div>
));
TipsSection.displayName = "TipsSection";

const QuoteSection = memo(({ quoteText, quoteAuthor, onChange }) => (
  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
    <h3 className="text-lg font-bold text-[#295557] mb-4 flex items-center">
      <span className="w-6 h-6 bg-[#e8a355] rounded-full flex items-center justify-center mr-3">
        <svg
          className="w-3 h-3 text-white"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </span>
      Add Quote (Optional)
    </h3>
    <div className="space-y-4">
      <div>
        <label
          htmlFor="quote_text"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Quote Text
        </label>
        <textarea
          id="quote_text"
          name="quote_text"
          value={quoteText}
          onChange={onChange}
          rows={3}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#295557] focus:outline-none transition-colors duration-300 text-gray-800"
          placeholder="Enter an inspiring quote..."
        />
      </div>
      <div>
        <label
          htmlFor="quote_author"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Quote Author
        </label>
        <input
          type="text"
          id="quote_author"
          name="quote_author"
          value={quoteAuthor}
          onChange={onChange}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#295557] focus:outline-none transition-colors duration-300 text-gray-800"
          placeholder="Author name"
        />
      </div>
    </div>
  </div>
));
QuoteSection.displayName = "QuoteSection";

const ImagePreviewOverlay = memo(
  ({ coverImage, imagePreview, onView, onRemove }) => (
    <div className="relative group">
      <img
        src={imagePreview || coverImage}
        alt="Cover preview"
        className="w-full h-40 object-cover rounded-lg"
        loading="lazy"
        decoding="async"
        onError={(e) => {
          e.target.style.display = "none";
          if (e.target.nextSibling) e.target.nextSibling.style.display = "flex";
        }}
      />
      <div className="hidden w-full h-40 bg-gray-200 rounded-lg items-center justify-center text-gray-500">
        <span>Failed to load image</span>
      </div>
      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center space-x-3">
        <button
          type="button"
          onClick={onView}
          className="p-2 bg-white rounded-full text-gray-700 hover:text-[#295557] transition-colors duration-300"
          aria-label="View image"
        >
          <EyeOutlined />
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="p-2 bg-white rounded-full text-gray-700 hover:text-red-500 transition-colors duration-300"
          aria-label="Remove image"
        >
          <DeleteOutlined />
        </button>
      </div>
    </div>
  )
);
ImagePreviewOverlay.displayName = "ImagePreviewOverlay";

// ─── Utilities ───────────────────────────────────────────────────────────

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

let urlDebounceTimer = null;

// ─── Main Component ──────────────────────────────────────────────────────

const AddBlogPage = () => {
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [quoteText, setQuoteText] = useState("");
  const [quoteAuthor, setQuoteAuthor] = useState("");

  // UI state
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [newCategoryModal, setNewCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryLoading, setNewCategoryLoading] = useState(false);
  const [imageInputMode, setImageInputMode] = useState("upload");
  const [imageUrl, setImageUrl] = useState("");
  const [objectUrl, setObjectUrl] = useState("");

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      if (urlDebounceTimer) clearTimeout(urlDebounceTimer);
    };
  }, [objectUrl]);

  // Check login status once
  useEffect(() => {
    try {
      const user = localStorage.getItem("user");
      if (user) {
        const parsedUser = JSON.parse(user);
        setIsLoggedIn(true);
        setUserData(parsedUser);
      }
    } catch {
      setIsLoggedIn(false);
    }
  }, []);

  // Fetch categories once
  useEffect(() => {
    let cancelled = false;
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `${base_url}/user/blog/select_categories.php`
        );
        if (!cancelled && response.data.status === "success") {
          setCategories(
            response.data.message.map((item) => ({
              label: item.category_name,
              value: String(item.category_id),
              id: String(item.category_id),
            }))
          );
        }
      } catch {
        if (!cancelled) setCategories([]);
      }
    };
    fetchCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  // ─── Callbacks ───────────────────────────────────────────────────────

  const handleGoToLogin = useCallback(() => {
    router.push("/login");
  }, [router]);

  const handleQuoteChange = useCallback((e) => {
    const { name, value } = e.target;
    if (name === "quote_text") setQuoteText(value);
    else if (name === "quote_author") setQuoteAuthor(value);
  }, []);

  // Upload file
  const uploadFile = useCallback(async (file) => {
    const fd = new FormData();
    fd.append("image", file);
    const response = await axios.post(
      `${base_url}/user/item_img_uploader.php`,
      fd,
      {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          setUploadProgress(Math.round((e.loaded * 100) / e.total));
        },
      }
    );
    if (response.status === 200) {
      return response.data?.image_url || response.data;
    }
    throw new Error(response.data?.message || "Upload failed");
  }, []);

  // Remove image & cleanup
  const removeImage = useCallback(() => {
    setCoverImage("");
    setImagePreview("");
    setImageUrl("");
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      setObjectUrl("");
    }
  }, [objectUrl]);

  // Image upload handler
  const handleImageUpload = useCallback(
    async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast.error(
          "Please select a valid image file (JPEG, PNG, WebP, GIF, SVG)"
        );
        return;
      }

      setUploading(true);
      setUploadProgress(0);

      // Create lightweight object URL preview
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
      setObjectUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return preview;
      });

      try {
        const uploadedUrl = await uploadFile(file);
        if (uploadedUrl) {
          setCoverImage(
            typeof uploadedUrl === "string" ? uploadedUrl : String(uploadedUrl)
          );
          toast.success("Image uploaded successfully!");
        } else {
          throw new Error("No image URL returned");
        }
      } catch {
        toast.error("Failed to upload image");
        setImagePreview("");
        if (preview) URL.revokeObjectURL(preview);
        setObjectUrl("");
      } finally {
        setUploading(false);
        setUploadProgress(0);
        // Reset input so same file can be re-selected
        event.target.value = "";
      }
    },
    [uploadFile]
  );

  // URL input with debounce
  const handleUrlInput = useCallback((url) => {
    setImageUrl(url);
    if (urlDebounceTimer) clearTimeout(urlDebounceTimer);
    urlDebounceTimer = setTimeout(() => {
      const trimmed = url.trim();
      if (trimmed) {
        setCoverImage(trimmed);
        setImagePreview(trimmed);
      } else {
        setCoverImage("");
        setImagePreview("");
      }
    }, 400);
  }, []);

  // Switch image mode
  const switchImageMode = useCallback((mode) => {
    setImageInputMode(mode);
    setCoverImage("");
    setImagePreview("");
    setImageUrl("");
    setObjectUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return "";
    });
  }, []);

  // View image
  const handleViewImage = useCallback(() => {
    if (coverImage) window.open(coverImage, "_blank", "noopener");
  }, [coverImage]);

  // Category change
  const handleCategoryChange = useCallback((value) => {
    setCategory(value);
  }, []);

  // Open file picker
  const openFilePicker = useCallback(() => {
    document.getElementById("image-upload")?.click();
  }, []);

  // Create new category via API
  const handleCreateCategory = useCallback(async () => {
    const name = newCategoryName.trim();
    if (!name) {
      toast.error("Please enter a category name");
      return;
    }

    const exists = categories.some(
      (cat) => cat.label.toLowerCase() === name.toLowerCase()
    );
    if (exists) {
      toast.error("Category already exists");
      return;
    }

    setNewCategoryLoading(true);
    try {
      const response = await axios.post(
        `${base_url}/user/blog/add_blog_category.php`,
        { category_name: name },
        { headers: { "Content-Type": "application/json" } }
      );

      const isSuccess =
        response.data?.status === "success" ||
        response.data?.message === "success" ||
        response.status === 200;

      if (isSuccess) {
        const newId = String(
          response.data?.category_id ||
            response.data?.id ||
            response.data?.message?.category_id ||
            `local_${Date.now()}`
        );

        const newCat = { label: name, value: newId, id: newId };
        setCategories((prev) => [...prev, newCat]);
        setCategory(newId);
        setNewCategoryModal(false);
        setNewCategoryName("");
        toast.success("Category created successfully!");
      } else {
        toast.error(response.data?.message || "Failed to create category");
      }
    } catch {
      toast.error("Failed to create category. Please try again.");
    } finally {
      setNewCategoryLoading(false);
    }
  }, [newCategoryName, categories]);

  // Submit form
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!isLoggedIn || !userData) {
        toast.error("Please login to add a post");
        return;
      }

      if (
        !title.trim() ||
        !description.trim() ||
        !category.trim() ||
        !coverImage.trim()
      ) {
        toast.error("Please fill in all required fields");
        return;
      }

      setLoading(true);
      try {
        const payload = {
          user_id: userData.user_id || userData.id,
          title: title.trim(),
          description: description.trim(),
          category: category.trim(),
          cover_image: coverImage.trim(),
          quote_text: quoteText.trim(),
          quote_author: quoteAuthor.trim(),
        };

        const response = await axios.post(
          `${base_url}/user/blog/add_blog.php`,
          payload,
          { headers: { "Content-Type": "application/json" } }
        );

        if (response.data.status === "success") {
          toast.success("Post created successfully!");
          router.push("/community");
        } else {
          toast.error(response.data.message || "Failed to create post");
        }
      } catch {
        toast.error("Error creating post");
      } finally {
        setLoading(false);
      }
    },
    [
      isLoggedIn,
      userData,
      title,
      description,
      category,
      coverImage,
      quoteText,
      quoteAuthor,
      router,
    ]
  );

  // Submit button disabled
  const isSubmitDisabled = useMemo(
    () => loading || uploading,
    [loading, uploading]
  );

  // Category dropdown render
  const categoryDropdownRender = useCallback(
    (menu) => (
      <>
        {menu}
        <div style={{ borderTop: "1px solid #f0f0f0", padding: "8px" }}>
          <button
            type="button"
            onClick={() => setNewCategoryModal(true)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "8px 12px",
              color: "#295557",
              background: "none",
              border: "1px dashed #295557",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 500,
              gap: "6px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f0f7f7";
              e.currentTarget.style.color = "#e8a355";
              e.currentTarget.style.borderColor = "#e8a355";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#295557";
              e.currentTarget.style.borderColor = "#295557";
            }}
          >
            <PlusOutlined />
            <span>Add New Category</span>
          </button>
        </div>
      </>
    ),
    []
  );

  // Category filter
  const categoryFilterOption = useCallback(
    (input, option) =>
      (option?.children ?? "").toLowerCase().includes(input.toLowerCase()),
    []
  );

  // Memoized category options
  const categoryOptions = useMemo(
    () =>
      categories.map((cat) => (
        <Option key={cat.id || cat.value} value={cat.value}>
          {cat.label}
        </Option>
      )),
    [categories]
  );

  // ─── Render ────────────────────────────────────────────────────────

  if (!isLoggedIn) {
    return <LoginRequiredView onLogin={handleGoToLogin} />;
  }

  return (
    <>
      <Breadcrumb pagename="Add Post" pagetitle="Add Post" />

      <div className="w-full bg-white py-12">
        <div className="w-full max-w-none px-6 lg:px-12">
          {/* Page Header */}
          <div className="mb-8 pb-6 border-b-2 border-[#e8a355]">
            <h1 className="text-4xl font-bold text-[#295557] mb-2">
              Create New Post
            </h1>
            <p className="text-gray-600 text-lg">
              Share your thoughts and ideas with our community
            </p>
          </div>

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="w-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Title Field */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-[#e8a355] transition-colors duration-300">
                  <label
                    htmlFor="title"
                    className="block text-sm font-bold text-[#295557] mb-3 uppercase tracking-wide"
                  >
                    Post Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg focus:border-[#295557] focus:outline-none transition-colors duration-300 text-gray-800 text-lg"
                    placeholder="Enter your post title..."
                    required
                    autoComplete="off"
                  />
                </div>

                {/* Description Field */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-[#e8a355] transition-colors duration-300">
                  <label
                    htmlFor="description"
                    className="block text-sm font-bold text-[#295557] mb-3 uppercase tracking-wide"
                  >
                    Post Content <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={12}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg focus:border-[#295557] focus:outline-none transition-colors duration-300 text-gray-800 leading-relaxed resize-none"
                    placeholder="Write your post content here..."
                    required
                  />
                </div>

                {/* Quote Section */}
                <QuoteSection
                  quoteText={quoteText}
                  quoteAuthor={quoteAuthor}
                  onChange={handleQuoteChange}
                />
              </div>

              {/* Right Column - Sidebar */}
              <div className="space-y-6">
                {/* Category Field */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-[#e8a355] transition-colors duration-300">
                  <label
                    htmlFor="category"
                    className="block text-sm font-bold text-[#295557] mb-3 uppercase tracking-wide"
                  >
                    Category <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={category || undefined}
                    onChange={handleCategoryChange}
                    placeholder="Select or create category"
                    style={{ width: "100%", height: "50px" }}
                    size="large"
                    showSearch
                    optionFilterProp="children"
                    filterOption={categoryFilterOption}
                    dropdownRender={categoryDropdownRender}
                    virtual={true}
                  >
                    {categoryOptions}
                  </Select>
                </div>

                {/* Cover Image Upload/URL */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-[#e8a355] transition-colors duration-300">
                  <label className="block text-sm font-bold text-[#295557] mb-3 uppercase tracking-wide">
                    Cover Image <span className="text-red-500">*</span>
                  </label>

                  {/* Image Input Mode Toggle */}
                  <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
                    <button
                      type="button"
                      onClick={() => switchImageMode("upload")}
                      className={`flex-1 py-2 px-3 rounded-tl-md rounded-bl-md text-sm font-medium transition-colors duration-300 flex items-center justify-center space-x-2 ${
                        imageInputMode === "upload"
                          ? "bg-[#295557] text-white"
                          : "text-gray-600 hover:text-[#295557]"
                      }`}
                    >
                      <UploadOutlined />
                      <span>Upload File</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => switchImageMode("url")}
                      className={`flex-1 py-2 px-3 rounded-tr-md rounded-br-md text-sm font-medium transition-colors duration-300 flex items-center justify-center space-x-2 ${
                        imageInputMode === "url"
                          ? "bg-[#295557] text-white"
                          : "text-gray-600 hover:text-[#295557]"
                      }`}
                    >
                      <LinkOutlined />
                      <span>Image URL</span>
                    </button>
                  </div>

                  {!coverImage ? (
                    <div className="space-y-4">
                      {imageInputMode === "upload" ? (
                        <>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#e8a355] transition-colors duration-300">
                            <input
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/svg+xml"
                              onChange={handleImageUpload}
                              className="hidden"
                              id="image-upload"
                              disabled={uploading}
                            />
                            <label
                              htmlFor="image-upload"
                              className="cursor-pointer flex flex-col items-center space-y-2"
                            >
                              <UploadOutlined className="text-3xl text-gray-400" />
                              <span className="text-gray-600">
                                {uploading
                                  ? "Uploading..."
                                  : "Click to upload image"}
                              </span>
                              <span className="text-sm text-gray-400">
                                All image formats supported
                              </span>
                            </label>
                          </div>

                          {uploading && (
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-[#e8a355] h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="space-y-3">
                          <input
                            type="url"
                            value={imageUrl}
                            onChange={(e) => handleUrlInput(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#295557] focus:outline-none transition-colors duration-300 text-gray-800"
                            placeholder="https://example.com/image.jpg"
                          />
                          <p className="text-sm text-gray-500">
                            Paste the URL of your image here
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <ImagePreviewOverlay
                        coverImage={coverImage}
                        imagePreview={imagePreview}
                        onView={handleViewImage}
                        onRemove={removeImage}
                      />

                      <div className="flex space-x-2">
                        {imageInputMode === "upload" ? (
                          <button
                            type="button"
                            onClick={openFilePicker}
                            className="flex-1 py-2 px-4 border border-[#295557] text-[#295557] rounded-lg hover:bg-[#295557] hover:text-white transition-colors duration-300"
                          >
                            Change Image
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => switchImageMode("url")}
                            className="flex-1 py-2 px-4 border border-[#295557] text-[#295557] rounded-lg hover:bg-[#295557] hover:text-white transition-colors duration-300"
                          >
                            Change URL
                          </button>
                        )}
                      </div>

                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/svg+xml"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                        disabled={uploading}
                      />
                    </div>
                  )}
                </div>

                {/* Publish Section */}
                <div className="bg-white border-2 border-[#295557] rounded-lg p-6">
                  <h3 className="text-lg font-bold text-[#295557] mb-4">
                    Publish
                  </h3>
                  <p className="text-gray-600 text-sm mb-6">
                    Ready to share your post with the world?
                  </p>

                  <button
                    type="submit"
                    disabled={isSubmitDisabled}
                    className="w-full bg-[#e8a355] text-white font-bold py-4 px-6 rounded-lg hover:bg-[#295557] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span>Publishing...</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        <span>Publish Post</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Tips Section */}
                <TipsSection />
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* New Category Modal */}
      <Modal
        title={
          <span style={{ color: "#295557", fontWeight: 700, fontSize: "18px" }}>
            Create New Category
          </span>
        }
        open={newCategoryModal}
        onOk={handleCreateCategory}
        onCancel={() => {
          if (newCategoryLoading) return;
          setNewCategoryModal(false);
          setNewCategoryName("");
        }}
        okText={newCategoryLoading ? "Creating..." : "Add Category"}
        cancelText="Cancel"
        confirmLoading={newCategoryLoading}
        okButtonProps={{
          style: {
            backgroundColor: "#e8a355",
            borderColor: "#e8a355",
            fontWeight: 600,
          },
          disabled: newCategoryLoading,
        }}
        cancelButtonProps={{ disabled: newCategoryLoading }}
        maskClosable={!newCategoryLoading}
        closable={!newCategoryLoading}
        destroyOnClose
      >
        <div className="py-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Category Name <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="Enter category name (e.g. Travel, Food, Adventure)"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onPressEnter={() => {
              if (!newCategoryLoading) handleCreateCategory();
            }}
            size="large"
            disabled={newCategoryLoading}
            style={{ borderColor: "#295557" }}
          />
          <p className="text-sm text-gray-500 mt-2">
            This category will be saved and available for future posts.
          </p>
        </div>
      </Modal>

      <LazyFooterSection />
    </>
  );
};

export default memo(AddBlogPage);
