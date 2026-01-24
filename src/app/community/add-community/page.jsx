"use client";
import { useState, useEffect } from "react";
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
import Newslatter from "@/components/common/Newslatter";
import Footer from "@/components/footer/Footer";
import { base_url } from "../../../uitils/base_url";

const { Option } = Select;

const AddBlogPage = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    cover_image: "",
    quote_text: "",
    quote_author: "",
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  // New states for enhancements
  const [uploadProgress, setUploadProgress] = useState({});
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [newCategoryModal, setNewCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [imageInputMode, setImageInputMode] = useState("upload"); // "upload" or "url"
  const [imageUrl, setImageUrl] = useState("");

  // Upload file function
  const uploadFile = async (file, fileType) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post(
        `${base_url}/user/item_img_uploader.php`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress((prev) => ({
              ...prev,
              [fileType]: progress,
            }));
          },
        }
      );

      if (response.status == 200) {
        return response.data || response.data.message;
      } else {
        throw new Error(response.data.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  // Handle image upload
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type only (no size constraint)
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error(
        "Please select a valid image file (JPEG, PNG, WebP, GIF, SVG)"
      );
      return;
    }

    setUploading(true);
    setUploadProgress({ cover_image: 0 });

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);

      // Upload file
      const response = await uploadFile(file, "cover_image");

      if (response || response.image_url) {
        const imageUrl = response || response.image_url;
        setFormData((prev) => ({
          ...prev,
          cover_image: imageUrl,
        }));
        toast.success("Image uploaded successfully!");
      } else {
        throw new Error("No image URL returned");
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error("Failed to upload image");
      setImagePreview("");
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  // Handle URL input
  const handleUrlInput = (url) => {
    setImageUrl(url);
    if (url.trim()) {
      setFormData((prev) => ({
        ...prev,
        cover_image: url.trim(),
      }));
      setImagePreview(url.trim());
    } else {
      setFormData((prev) => ({
        ...prev,
        cover_image: "",
      }));
      setImagePreview("");
    }
  };

  // Handle new category creation (LOCAL ONLY)
  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    const categoryName = newCategoryName.trim();

    // Check if category already exists
    const categoryExists = categories.some(
      (cat) => cat.value.toLowerCase() === categoryName.toLowerCase()
    );

    if (categoryExists) {
      toast.error("Category already exists");
      return;
    }

    // Add category locally with label and value structure
    const newCategory = {
      label: categoryName,
      value: categoryName,
    };

    setCategories((prev) => [...prev, newCategory]);
    setFormData((prev) => ({ ...prev, category: categoryName }));
    setNewCategoryModal(false);
    setNewCategoryName("");
    toast.success("Category added successfully!");
  };

  // Remove uploaded image
  const removeImage = () => {
    setFormData((prev) => ({ ...prev, cover_image: "" }));
    setImagePreview("");
    setImageUrl("");
  };

  // Switch image input mode
  const switchImageMode = (mode) => {
    setImageInputMode(mode);
    removeImage();
  };

  // Check login status
  useEffect(() => {
    try {
      const user = localStorage.getItem("user");
      if (user) {
        const parsedUser = JSON.parse(user);
        setIsLoggedIn(true);
        setUserData(parsedUser);
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("Error checking login status:", error);
      setIsLoggedIn(false);
    }
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `${base_url}/user/blog/select_categories.php`
        );

        if (response.data.status === "success") {
          const transformedCategories = response.data.message.map((item) => ({
            label: item.category_name,
            value: item.category_id,
            id: item.category_id,
          }));
          setCategories(transformedCategories);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
        toast.error("Failed to fetch categories");
      }
    };

    fetchCategories();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLoggedIn) {
      toast.error("Please login to add a post");
      return;
    }

    // Basic validation
    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.category.trim() ||
      !formData.cover_image.trim()
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      // Prepare payload
      const payload = {
        user_id: userData.user_id || userData.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category.trim(),
        cover_image: formData.cover_image.trim(),
        quote_text: formData.quote_text.trim(),
        quote_author: formData.quote_author.trim(),
      };

      const response = await axios.post(
        `${base_url}/user/blog/add_blog.php`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        toast.success("Post created successfully!");
        router.push("/community");
      } else {
        toast.error(response.data.message || "Failed to create post");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Error creating post");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
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
              onClick={() => router.push("/login")}
              className="w-full bg-[#e8a355] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#295557] transition-colors duration-300"
            >
              Go to Login
            </button>
          </div>
        </div>
        <Newslatter />
        <Footer />
      </>
    );
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
            {/* Form Grid Container */}
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
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg focus:border-[#295557] focus:outline-none transition-colors duration-300 text-gray-800 text-lg"
                    placeholder="Enter your post title..."
                    required
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
                    value={formData.description}
                    onChange={handleChange}
                    rows={12}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg focus:border-[#295557] focus:outline-none transition-colors duration-300 text-gray-800 leading-relaxed resize-none"
                    placeholder="Write your post content here..."
                    required
                  />
                </div>

                {/* Quote Section */}
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
                        value={formData.quote_text}
                        onChange={handleChange}
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
                        value={formData.quote_author}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#295557] focus:outline-none transition-colors duration-300 text-gray-800"
                        placeholder="Author name"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Sidebar */}
              <div className="space-y-6">
                {/* Category Field with Antd Select */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-[#e8a355] transition-colors duration-300">
                  <label
                    htmlFor="category"
                    className="block text-sm font-bold text-[#295557] mb-3 uppercase tracking-wide"
                  >
                    Category <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.category || undefined} // ✅ Added || undefined for placeholder to show
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, category: value }))
                    }
                    placeholder="Select or create category"
                    style={{ width: "100%", height: "50px" }}
                    size="large"
                    showSearch // ✅ Added search functionality
                    optionFilterProp="children" // ✅ Filter based on label text
                    filterOption={(input, option) =>
                      (option?.children ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    // dropdownRender={(menu) => (
                    //   <>
                    //     {menu}
                    //     <div className="border-t border-gray-200 p-2">
                    //       <button
                    //         type="button"
                    //         onClick={() => setNewCategoryModal(true)}
                    //         className="w-full flex items-center justify-center py-2 px-3 text-[#295557] hover:text-[#e8a355] transition-colors duration-300"
                    //       >
                    //         <PlusOutlined className="mr-2" />
                    //         Add New Category
                    //       </button>
                    //     </div>
                    //   </>
                    // )}
                  >
                    {categories.map((cat) => (
                      <Option key={cat.id || cat.value} value={cat.value}>
                        {cat.label}
                      </Option>
                    ))}
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

                  {!formData.cover_image ? (
                    <div className="space-y-4">
                      {imageInputMode === "upload" ? (
                        <>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#e8a355] transition-colors duration-300">
                            <input
                              type="file"
                              accept="image/*"
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
                                style={{
                                  width: `${uploadProgress.cover_image || 0}%`,
                                }}
                              ></div>
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
                      <div className="relative group">
                        <img
                          src={imagePreview || formData.cover_image}
                          alt="Cover preview"
                          className="w-full h-40 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                        <div className="hidden w-full h-40 bg-gray-200 rounded-lg items-center justify-center text-gray-500">
                          <span>Failed to load image</span>
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center space-x-3">
                          <button
                            type="button"
                            onClick={() =>
                              window.open(formData.cover_image, "_blank")
                            }
                            className="p-2 bg-white rounded-full text-gray-700 hover:text-[#295557] transition-colors duration-300"
                          >
                            <EyeOutlined />
                          </button>
                          <button
                            type="button"
                            onClick={removeImage}
                            className="p-2 bg-white rounded-full text-gray-700 hover:text-red-500 transition-colors duration-300"
                          >
                            <DeleteOutlined />
                          </button>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        {imageInputMode === "upload" ? (
                          <button
                            type="button"
                            onClick={() =>
                              document.getElementById("image-upload").click()
                            }
                            className="flex-1 py-2 px-4 border border-[#295557] text-[#295557] rounded-lg hover:bg-[#295557] hover:text-white transition-colors duration-300"
                          >
                            Change Image
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setImageInputMode("url");
                              removeImage();
                            }}
                            className="flex-1 py-2 px-4 border border-[#295557] text-[#295557] rounded-lg hover:bg-[#295557] hover:text-white transition-colors duration-300"
                          >
                            Change URL
                          </button>
                        )}
                      </div>

                      <input
                        type="file"
                        accept="image/*"
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
                    Ready to share your post post with the world?
                  </p>

                  <button
                    type="submit"
                    disabled={loading || uploading}
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
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
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
                        <span>Publish post</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Tips Section */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-[#295557] mb-4">
                    Writing Tips
                  </h3>
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-[#e8a355] rounded-full mt-2 flex-shrink-0"></div>
                      <p>Write compelling titles that grab attention</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-[#e8a355] rounded-full mt-2 flex-shrink-0"></div>
                      <p>Use high-quality images for better engagement</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-[#e8a355] rounded-full mt-2 flex-shrink-0"></div>
                      <p>Keep your content clear and well-structured</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-[#e8a355] rounded-full mt-2 flex-shrink-0"></div>
                      <p>Proofread before publishing</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* New Category Modal */}
      <Modal
        title="Create New Category"
        open={newCategoryModal}
        onOk={handleCreateCategory}
        onCancel={() => {
          setNewCategoryModal(false);
          setNewCategoryName("");
        }}
        okText="Add Category"
        cancelText="Cancel"
        okButtonProps={{
          style: { backgroundColor: "#e8a355", borderColor: "#e8a355" },
        }}
      >
        <div className="py-4">
          <Input
            placeholder="Enter category name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onPressEnter={handleCreateCategory}
            size="large"
          />
          <p className="text-sm text-gray-500 mt-2">
            This category will be added locally and sent with your post.
          </p>
        </div>
      </Modal>

      <Newslatter />
      <Footer />
    </>
  );
};

export default AddBlogPage;
