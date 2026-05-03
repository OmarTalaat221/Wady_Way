"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import Link from "next/link";
import { Select, Tooltip, Modal } from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
  UploadOutlined,
  LinkOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { base_url } from "../../../uitils/base_url";
import toast from "react-hot-toast";

const { Option } = Select;

const page = () => {
  const [allBlogs, setAllBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [displayBlogs, setDisplayBlogs] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 6;

  const [categories, setCategories] = useState([
    { label: "All", value: "All" },
  ]);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [blogToEdit, setBlogToEdit] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    cover_image: "",
    description: "",
    quote_text: "",
    quote_author: "",
    category: "",
  });
  const [editErrors, setEditErrors] = useState({});

  // Image upload state for edit modal
  const [imageMode, setImageMode] = useState("url"); // "url" | "upload"
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const editFileInputRef = useRef(null);

  // Categories for edit form (without "All" option)
  const [editCategories, setEditCategories] = useState([]);

  const statusOptions = [
    { label: "All Status", value: "All" },
    { label: "Published", value: "published" },
    { label: "Draft", value: "draft" },
    { label: "Hidden", value: "hidden" },
  ];

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
      setIsLoggedIn(false);
    }
  }, []);

  const fetchUserBlogs = async () => {
    if (!userData?.user_id && !userData?.id) return;

    setLoading(true);
    try {
      const response = await axios.post(
        `${base_url}/user/blog/user_blogs.php`,
        { user_id: userData.user_id || userData.id },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.status === "success") {
        const blogs = response.data.message;
        setAllBlogs(blogs);
        setFilteredBlogs(blogs);
        setDisplayBlogs(blogs.slice(0, blogsPerPage));
      } else {
        setAllBlogs([]);
        setFilteredBlogs([]);
        setDisplayBlogs([]);
      }
    } catch (error) {
      console.error("Error fetching user blogs:", error);
      setAllBlogs([]);
      setFilteredBlogs([]);
      setDisplayBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const filterBlogs = (category = activeFilter, status = statusFilter) => {
    setActiveFilter(category);
    setStatusFilter(status);
    setCurrentPage(1);

    let filtered = allBlogs;
    if (category !== "All") {
      filtered = filtered.filter((blog) => blog.category === category);
    }
    if (status !== "All") {
      filtered = filtered.filter((blog) => blog.status === status);
    }

    setFilteredBlogs(filtered);
    setDisplayBlogs(filtered.slice(0, blogsPerPage));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const startIndex = (page - 1) * blogsPerPage;
    const endIndex = startIndex + blogsPerPage;
    setDisplayBlogs(filteredBlogs.slice(startIndex, endIndex));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getTotalPages = () => Math.ceil(filteredBlogs.length / blogsPerPage);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString("en-US", { month: "short" });
    return { day, month };
  };

  const calculateReadTime = (title) => {
    const words = title.split(" ").length;
    return Math.max(1, Math.ceil(words / 50));
  };

  const generatePaginationNumbers = () => {
    const totalPages = getTotalPages();
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }
    return pages;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "published":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <EyeOutlined className="mr-1" />
            Published
          </span>
        );
      case "draft":
        return (
          <Tooltip title="Waiting for admin approval">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 cursor-help">
              <ClockCircleOutlined className="mr-1" />
              Draft
            </span>
          </Tooltip>
        );
      case "hidden":
        return (
          <Tooltip title="This blog is hidden from public view">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 cursor-help">
              <EyeInvisibleOutlined className="mr-1" />
              Hidden
            </span>
          </Tooltip>
        );
      default:
        return null;
    }
  };

  // ===================== FILE UPLOAD =====================

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

  const handleEditFileSelect = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!validTypes.includes(file.type)) {
        toast.error("Please select a valid image file (JPG, PNG, GIF, WEBP).");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB.");
        return;
      }

      setUploading(true);
      setUploadProgress(0);

      try {
        const imageUrl = await uploadFile(file);

        if (imageUrl && typeof imageUrl === "string") {
          handleEditFormChange("cover_image", imageUrl);
          toast.success("Image uploaded successfully!");
        } else {
          toast.error("Upload returned an invalid URL.");
        }
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Failed to upload image. Please try again.");
      } finally {
        setUploading(false);
        setUploadProgress(0);
        // Reset file input
        if (editFileInputRef.current) {
          editFileInputRef.current.value = "";
        }
      }
    },
    [uploadFile]
  );

  // ===================== DELETE LOGIC =====================

  const handleDeleteClick = useCallback((blog, e) => {
    e.preventDefault();
    e.stopPropagation();
    setBlogToDelete(blog);
    setDeleteModalOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!blogToDelete) return;

    setDeleting(true);
    try {
      const response = await axios.post(
        `${base_url}/user/blog/delete_blog.php`,
        {
          blog_id: blogToDelete.blog_id,
          user_id: userData?.user_id || userData?.id,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      if (
        response.data.status === "success" ||
        response.data.success === true
      ) {
        toast.success("Blog deleted successfully!");

        const updatedAll = allBlogs.filter(
          (b) => b.blog_id !== blogToDelete.blog_id
        );
        setAllBlogs(updatedAll);

        let updatedFiltered = updatedAll;
        if (activeFilter !== "All") {
          updatedFiltered = updatedFiltered.filter(
            (blog) => blog.category === activeFilter
          );
        }
        if (statusFilter !== "All") {
          updatedFiltered = updatedFiltered.filter(
            (blog) => blog.status === statusFilter
          );
        }
        setFilteredBlogs(updatedFiltered);

        const newTotalPages = Math.ceil(updatedFiltered.length / blogsPerPage);
        let newCurrentPage = currentPage;
        if (newCurrentPage > newTotalPages && newTotalPages > 0) {
          newCurrentPage = newTotalPages;
        } else if (newTotalPages === 0) {
          newCurrentPage = 1;
        }
        setCurrentPage(newCurrentPage);

        const startIndex = (newCurrentPage - 1) * blogsPerPage;
        setDisplayBlogs(
          updatedFiltered.slice(startIndex, startIndex + blogsPerPage)
        );

        setDeleteModalOpen(false);
        setBlogToDelete(null);
      } else {
        const errorMsg =
          response.data.message ||
          response.data.error ||
          "Failed to delete blog.";
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Error deleting blog:", error);
      if (error.response) {
        toast.error(
          error.response.data?.message ||
            error.response.data?.error ||
            "Failed to delete blog. Please try again."
        );
      } else if (error.request) {
        toast.error(
          "Network error. Please check your connection and try again."
        );
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setDeleting(false);
    }
  }, [
    blogToDelete,
    allBlogs,
    activeFilter,
    statusFilter,
    currentPage,
    blogsPerPage,
    userData,
  ]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteModalOpen(false);
    setBlogToDelete(null);
  }, []);

  // ===================== EDIT LOGIC =====================

  const handleEditClick = useCallback((blog, e) => {
    e.preventDefault();
    e.stopPropagation();
    setBlogToEdit(blog);
    setEditForm({
      title: blog.title || "",
      cover_image: blog.cover_image || "",
      description: blog.description || "",
      quote_text: blog.quote_text || "",
      quote_author: blog.quote_author || "",
      category: blog.category || "",
    });
    setEditErrors({});
    setImageMode("url");
    setUploading(false);
    setUploadProgress(0);
    setEditModalOpen(true);
  }, []);

  const handleEditFormChange = useCallback((field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
    setEditErrors((prev) => {
      if (prev[field]) {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      }
      return prev;
    });
  }, []);

  const validateEditForm = () => {
    const errors = {};
    if (!editForm.title?.trim()) {
      errors.title = "Title is required.";
    }
    if (!editForm.description?.trim()) {
      errors.description = "Description is required.";
    }
    if (!editForm.category?.trim()) {
      errors.category = "Category is required.";
    }
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditConfirm = useCallback(async () => {
    if (!blogToEdit) return;
    if (!validateEditForm()) return;

    setEditing(true);
    try {
      const payload = {
        user_id: userData?.user_id || userData?.id,
        blog_id: blogToEdit.blog_id,
        title: editForm.title.trim(),
        cover_image: editForm.cover_image.trim(),
        description: editForm.description.trim(),
        quote_text: editForm.quote_text.trim(),
        quote_author: editForm.quote_author.trim(),
        category: editForm.category.trim(),
      };

      const response = await axios.post(
        `${base_url}/user/blog/edit_blog.php`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      if (
        response.data.status === "success" ||
        response.data.success === true
      ) {
        toast.success("Blog updated successfully!");

        const updatedBlog = {
          ...blogToEdit,
          title: editForm.title.trim(),
          cover_image: editForm.cover_image.trim(),
          description: editForm.description.trim(),
          quote_text: editForm.quote_text.trim(),
          quote_author: editForm.quote_author.trim(),
          category: editForm.category.trim(),
        };

        const updateInList = (list) =>
          list.map((b) => (b.blog_id === blogToEdit.blog_id ? updatedBlog : b));

        setAllBlogs((prev) => updateInList(prev));
        setFilteredBlogs((prev) => updateInList(prev));
        setDisplayBlogs((prev) => updateInList(prev));

        setEditModalOpen(false);
        setBlogToEdit(null);
        setEditForm({
          title: "",
          cover_image: "",
          description: "",
          quote_text: "",
          quote_author: "",
          category: "",
        });
        setEditErrors({});
      } else {
        const errorMsg =
          response.data.message ||
          response.data.error ||
          "Failed to update blog.";
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Error editing blog:", error);
      if (error.response) {
        toast.error(
          error.response.data?.message ||
            error.response.data?.error ||
            "Failed to update blog. Please try again."
        );
      } else if (error.request) {
        toast.error(
          "Network error. Please check your connection and try again."
        );
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setEditing(false);
    }
  }, [blogToEdit, editForm, userData]);

  const handleEditCancel = useCallback(() => {
    if (editing || uploading) return;
    setEditModalOpen(false);
    setBlogToEdit(null);
    setEditForm({
      title: "",
      cover_image: "",
      description: "",
      quote_text: "",
      quote_author: "",
      category: "",
    });
    setEditErrors({});
    setImageMode("url");
    setUploading(false);
    setUploadProgress(0);
  }, [editing, uploading]);

  // ===================== END EDIT LOGIC =====================

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `${base_url}/user/blog/select_categories.php`
        );

        if (
          response.data.status === "success" &&
          Array.isArray(response.data.message)
        ) {
          const transformedCategories = response.data.message.map((item) => ({
            label: item.category_name,
            value: item.category_id,
            id: item.category_id,
          }));

          const uniqueCategories = transformedCategories.filter(
            (cat, index, self) =>
              index ===
              self.findIndex(
                (c) => c.label.toLowerCase() === cat.label.toLowerCase()
              )
          );

          setCategories([
            { label: "All", value: "All" },
            ...uniqueCategories.map((c) => ({ label: c.label, value: c.id })),
          ]);

          setEditCategories(uniqueCategories);
        } else {
          setCategories([{ label: "All", value: "All" }]);
          setEditCategories([]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([{ label: "All", value: "All" }]);
        setEditCategories([]);
      }
    };

    fetchCategories();
  }, []);

  const handleBlogClick = (blog, e) => {
    if (blog.status !== "published") {
      e.preventDefault();
      if (blog.status === "draft") {
        toast.error(
          "This blog is still in draft mode and awaiting admin approval."
        );
      } else if (blog.status === "hidden") {
        toast.error("This blog is currently hidden from public view.");
      }
    }
  };

  useEffect(() => {
    if (userData) fetchUserBlogs();
  }, [userData]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * blogsPerPage;
    const endIndex = startIndex + blogsPerPage;
    setDisplayBlogs(filteredBlogs.slice(startIndex, endIndex));
  }, [filteredBlogs, currentPage]);

  const totalPages = getTotalPages();

  if (!isLoggedIn) {
    return (
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
          <p className="text-gray-600 mb-6">Please login to view your blogs.</p>
          <Link
            href="/login"
            className="w-full inline-block bg-[#e8a355] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#295557] transition-colors duration-300"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="blod-grid-section pt-0 mb-[20px]">
        <div className="container">
          {/* Header Section */}
          <div className="mb-8">
            {/* Mobile Layout */}
            <div className="block lg:hidden space-y-4">
              <div className="text-center">
                <Link
                  href="/community/add-community"
                  className="inline-flex items-center px-6 py-3 bg-[#295557] text-white font-medium rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <PlusOutlined className="mr-2" />
                  Add New Blog
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Category
                  </label>
                  <Select
                    value={activeFilter}
                    onChange={(value) => filterBlogs(value, statusFilter)}
                    className="w-full"
                    size="large"
                    placeholder="Select category"
                  >
                    {categories.map((cat) => (
                      <Option key={cat.value} value={cat.value}>
                        {cat.label}
                      </Option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Status
                  </label>
                  <Select
                    value={statusFilter}
                    onChange={(value) => filterBlogs(activeFilter, value)}
                    className="w-full"
                    size="large"
                    placeholder="Select status"
                  >
                    {statusOptions.map((option) => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:flex lg:items-center lg:justify-between lg:gap-6">
              <div className="flex items-center gap-4 flex-1">
                <div className="min-w-0 flex-1 max-w-xs">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <Select
                    value={activeFilter}
                    onChange={(value) => filterBlogs(value, statusFilter)}
                    className="w-full"
                    size="large"
                    placeholder="Select category"
                  >
                    {categories.map((cat) => (
                      <Option key={cat.value} value={cat.value}>
                        {cat.label}
                      </Option>
                    ))}
                  </Select>
                </div>
                <div className="min-w-0 flex-1 max-w-xs">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <Select
                    value={statusFilter}
                    onChange={(value) => filterBlogs(activeFilter, value)}
                    className="w-full"
                    size="large"
                    placeholder="Select status"
                  >
                    {statusOptions.map((option) => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="mt-6">
                  <Link
                    href="/community/add-community"
                    className="inline-flex items-center px-6 py-3 bg-[#295557] text-white font-medium rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <PlusOutlined className="mr-2" />
                    Add New Blog
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Results Counter */}
          <div className="text-center mb-6">
            <p className="text-gray-600">
              Showing {displayBlogs.length} of {filteredBlogs.length} blogs
              {activeFilter !== "All" && ` in "${activeFilter}"`}
              {statusFilter !== "All" && ` with "${statusFilter}" status`}
            </p>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#295557]"></div>
            </div>
          ) : (
            <>
              {/* Blog Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-[70px]">
                {displayBlogs.length > 0 ? (
                  displayBlogs.map((blog) => {
                    const { day, month } = formatDate(blog.created_at);

                    return (
                      <div key={blog.blog_id} className="w-full">
                        <div
                          className="blog-card"
                          style={{
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          {/* Image Section */}
                          <div className="blog-card-img-wrap relative">
                            {blog.status === "published" ? (
                              <Link
                                href={`/community/community-details?community_id=${blog.blog_id}`}
                                className="card-img"
                              >
                                <img
                                  style={{
                                    height: "280px",
                                    width: "100%",
                                    objectFit: "cover",
                                    display: "block",
                                  }}
                                  src={blog.cover_image}
                                  alt={blog.title}
                                  onError={(e) => {
                                    e.target.src =
                                      "/assets/img/blog/default-blog.jpg";
                                  }}
                                />
                              </Link>
                            ) : (
                              <div
                                className="card-img cursor-not-allowed"
                                onClick={(e) => handleBlogClick(blog, e)}
                              >
                                <img
                                  style={{
                                    height: "280px",
                                    width: "100%",
                                    objectFit: "cover",
                                    display: "block",
                                    filter:
                                      blog.status !== "published"
                                        ? "grayscale(50%)"
                                        : "none",
                                  }}
                                  src={blog.cover_image}
                                  alt={blog.title}
                                  onError={(e) => {
                                    e.target.src =
                                      "/assets/img/blog/default-blog.jpg";
                                  }}
                                />
                              </div>
                            )}

                            <div className="date">
                              <span>
                                <strong>{day}</strong> <br />
                                {month}
                              </span>
                            </div>

                            {/* Status Badge */}
                            <div className="absolute top-3 right-3 z-[5]">
                              {getStatusBadge(blog.status)}
                            </div>

                            {/* Delete Button on Image */}
                            <div className="absolute bottom-3 right-3 z-[5]">
                              <Tooltip title="Delete this blog">
                                <button
                                  onClick={(e) => handleDeleteClick(blog, e)}
                                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white/90 hover:bg-red-500 text-red-500 hover:text-white shadow-md backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:scale-110"
                                  aria-label={`Delete blog: ${blog.title}`}
                                >
                                  <DeleteOutlined
                                    style={{ fontSize: "15px" }}
                                  />
                                </button>
                              </Tooltip>
                            </div>
                          </div>

                          {/* Content Section */}
                          <div
                            className="blog-card-content"
                            style={{
                              flex: "1",
                              display: "flex",
                              flexDirection: "column",
                            }}
                          >
                            <div className="blog-card-content-top">
                              <ul>
                                <li>
                                  By{" "}
                                  <span className="text-[#295557] font-medium">
                                    {userData?.full_name ||
                                      userData?.name ||
                                      "You"}
                                  </span>
                                </li>
                                <li>
                                  <span className="text-[#e8a355]">
                                    {blog.category_name}
                                  </span>
                                </li>
                              </ul>
                            </div>

                            <h5
                              style={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                minHeight: "3.2em",
                                lineHeight: "1.6em",
                                margin: "0 0 auto 0",
                              }}
                            >
                              {blog.status === "published" ? (
                                <Link
                                  href={`/community/community-details?community_id=${blog.blog_id}`}
                                >
                                  {blog.title}
                                </Link>
                              ) : (
                                <span
                                  className="cursor-not-allowed text-gray-600"
                                  onClick={(e) => handleBlogClick(blog, e)}
                                >
                                  {blog.title}
                                </span>
                              )}
                            </h5>

                            <div
                              className="bottom-area mt-4"
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "8px",
                              }}
                            >
                              <div style={{ flex: 1, minWidth: 0 }}>
                                {blog.status === "published" ? (
                                  <Link
                                    href={`/community/community-details?community_id=${blog.blog_id}`}
                                  >
                                    View Post
                                    <span>
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width={14}
                                        height={12}
                                        viewBox="0 0 14 12"
                                        fill="none"
                                      >
                                        <path
                                          d="M2.07617 8.73272L12.1899 2.89355"
                                          strokeLinecap="round"
                                        />
                                        <path
                                          d="M10.412 7.59764L12.1908 2.89295L7.22705 2.08105"
                                          strokeLinecap="round"
                                        />
                                      </svg>
                                    </span>
                                  </Link>
                                ) : (
                                  <span
                                    className="cursor-not-allowed text-gray-400"
                                    onClick={(e) => handleBlogClick(blog, e)}
                                  >
                                    {blog.status === "draft"
                                      ? "Pending Approval"
                                      : "Not Available"}
                                    <span>
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width={14}
                                        height={12}
                                        viewBox="0 0 14 12"
                                        fill="none"
                                      >
                                        <path
                                          d="M2.07617 8.73272L12.1899 2.89355"
                                          strokeLinecap="round"
                                        />
                                        <path
                                          d="M10.412 7.59764L12.1908 2.89295L7.22705 2.08105"
                                          strokeLinecap="round"
                                        />
                                      </svg>
                                    </span>
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 flex-shrink-0">
                                <Tooltip title="Edit this blog">
                                  <button
                                    onClick={(e) => handleEditClick(blog, e)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#295557] hover:text-white bg-[#295557]/10 hover:bg-[#295557] rounded-lg transition-all duration-300"
                                    aria-label={`Edit blog: ${blog.title}`}
                                  >
                                    <EditOutlined
                                      style={{ fontSize: "12px" }}
                                    />
                                    Edit
                                  </button>
                                </Tooltip>

                                <button
                                  onClick={(e) => handleDeleteClick(blog, e)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 hover:text-white bg-red-50 hover:bg-red-500 rounded-lg transition-all duration-300"
                                  aria-label={`Delete blog: ${blog.title}`}
                                >
                                  <DeleteOutlined
                                    style={{ fontSize: "12px" }}
                                  />
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full">
                    <div className="text-center py-20">
                      <div className="mb-4">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <h4 className="text-gray-500 mb-2">No blogs found</h4>
                      <p className="text-gray-400 mb-6">
                        {activeFilter !== "All" || statusFilter !== "All"
                          ? "No blogs found with the current filters. Try adjusting your filters."
                          : "You haven't created any blogs yet."}
                      </p>
                      <Link
                        href="/community/add-community"
                        className="inline-flex items-center px-6 py-3 bg-[#e8a355] text-white font-medium rounded-lg hover:bg-[#295557] transition-colors duration-300"
                      >
                        <PlusOutlined className="mr-2" />
                        Create Your First Blog
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="row">
                  <div className="col-lg-12">
                    <nav className="inner-pagination-area">
                      <ul className="pagination-list">
                        <li>
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`shop-pagi-btn ${
                              currentPage === 1
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:bg-gray-100"
                            }`}
                          >
                            <i className="bi bi-chevron-left" />
                          </button>
                        </li>
                        {generatePaginationNumbers().map((page, index) => (
                          <li key={index}>
                            {page === "..." ? (
                              <span className="px-3 py-2 text-gray-400">
                                <i className="bi bi-three-dots" />
                              </span>
                            ) : (
                              <button
                                onClick={() => handlePageChange(page)}
                                className={`px-3 py-2 rounded transition-colors duration-200 ${
                                  currentPage === page
                                    ? "active bg-[#295557] text-white"
                                    : "hover:bg-gray-100 text-gray-700"
                                }`}
                              >
                                {page}
                              </button>
                            )}
                          </li>
                        ))}
                        <li>
                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`shop-pagi-btn ${
                              currentPage === totalPages
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:bg-gray-100"
                            }`}
                          >
                            <i className="bi bi-chevron-right" />
                          </button>
                        </li>
                      </ul>
                      <div className="text-center mt-4">
                        <span className="text-sm text-gray-500">
                          Page {currentPage} of {totalPages} (
                          {filteredBlogs.length} total blogs)
                        </span>
                      </div>
                    </nav>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ===================== DELETE CONFIRMATION MODAL ===================== */}
      <Modal
        open={deleteModalOpen}
        onCancel={handleDeleteCancel}
        footer={null}
        centered
        destroyOnClose
        width={460}
        closable={!deleting}
        maskClosable={!deleting}
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-red-50 flex items-center justify-center">
            <ExclamationCircleOutlined
              style={{ fontSize: "32px", color: "#ef4444" }}
            />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Delete Blog Post
          </h3>
          <p className="text-gray-500 mb-2 text-sm">
            Are you sure you want to delete this blog?
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleDeleteCancel}
              disabled={deleting}
              className="flex-1 max-w-[180px] px-5 py-2.5 border-2 border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="flex-1 max-w-[180px] px-5 py-2.5 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {deleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <DeleteOutlined style={{ fontSize: "14px" }} />
                  Delete
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* ===================== EDIT BLOG MODAL ===================== */}
      <Modal
        open={editModalOpen}
        onCancel={handleEditCancel}
        footer={null}
        centered
        destroyOnClose
        width={620}
        closable={!editing && !uploading}
        maskClosable={!editing && !uploading}
        styles={{
          body: {
            maxHeight: "calc(100vh - 200px)",
            overflowY: "auto",
            overflowX: "hidden",
            padding: "0",
          },
        }}
        title={
          <div className="flex items-center gap-3 pb-2">
            <div className="w-9 h-9 rounded-lg bg-[#295557]/10 flex items-center justify-center flex-shrink-0">
              <EditOutlined style={{ fontSize: "18px", color: "#295557" }} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 m-0">
                Edit Blog Post
              </h3>
              <p className="text-xs text-gray-400 m-0 mt-0.5">
                Update your blog information
              </p>
            </div>
          </div>
        }
      >
        {/* Scrollable form content */}
        <div style={{ padding: "20px 24px 0 24px" }}>
          <div className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => handleEditFormChange("title", e.target.value)}
                placeholder="Enter blog title..."
                className={`w-full px-4 py-2.5 rounded-lg border text-sm text-gray-800 placeholder-gray-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-[#295557]/20 focus:border-[#295557] ${
                  editErrors.title
                    ? "border-red-400 bg-red-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              />
              {editErrors.title && (
                <p className="mt-1 text-xs text-red-500">{editErrors.title}</p>
              )}
            </div>

            {/* ==================== COVER IMAGE SECTION ==================== */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Cover Image
              </label>

              {/* Tab Toggle: URL vs Upload */}
              <div className="flex mb-3 rounded-lg border border-gray-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setImageMode("url")}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium transition-all duration-200 ${
                    imageMode === "url"
                      ? "bg-[#295557] text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <LinkOutlined style={{ fontSize: "13px" }} />
                  Paste URL
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode("upload")}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium transition-all duration-200 ${
                    imageMode === "upload"
                      ? "bg-[#295557] text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <UploadOutlined style={{ fontSize: "13px" }} />
                  Upload Image
                </button>
              </div>

              {/* URL Input */}
              {imageMode === "url" && (
                <input
                  type="text"
                  value={editForm.cover_image}
                  onChange={(e) =>
                    handleEditFormChange("cover_image", e.target.value)
                  }
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white hover:border-gray-300 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-[#295557]/20 focus:border-[#295557]"
                />
              )}

              {/* Upload Area */}
              {imageMode === "upload" && (
                <div>
                  {/* Hidden file input */}
                  <input
                    ref={editFileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleEditFileSelect}
                    className="hidden"
                  />

                  {/* Upload button / dropzone */}
                  {!uploading ? (
                    <button
                      type="button"
                      onClick={() => editFileInputRef.current?.click()}
                      className="w-full flex flex-col items-center justify-center gap-2 px-4 py-6 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:border-[#295557] hover:bg-[#295557]/5 transition-all duration-200 cursor-pointer group"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#295557]/10 flex items-center justify-center group-hover:bg-[#295557]/20 transition-colors">
                        <UploadOutlined
                          style={{ fontSize: "18px", color: "#295557" }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 group-hover:text-[#295557] font-medium">
                        Click to select an image
                      </span>
                      <span className="text-xs text-gray-400">
                        JPG, PNG, GIF, WEBP — Max 5MB
                      </span>
                    </button>
                  ) : (
                    /* Uploading state */
                    <div className="w-full px-4 py-6 rounded-lg border-2 border-dashed border-[#295557]/30 bg-[#295557]/5">
                      <div className="flex flex-col items-center gap-3">
                        <LoadingOutlined
                          style={{ fontSize: "24px", color: "#295557" }}
                          spin
                        />
                        <span className="text-sm text-[#295557] font-medium">
                          Uploading... {uploadProgress}%
                        </span>
                        {/* Progress bar */}
                        <div className="w-full max-w-xs h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${uploadProgress}%`,
                              backgroundColor: "#295557",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Image Preview */}
              {editForm.cover_image && (
                <div className="mt-3 relative rounded-lg overflow-hidden border border-gray-200 group">
                  <img
                    src={editForm.cover_image}
                    alt="Cover preview"
                    className="w-full object-cover"
                    style={{ height: "140px" }}
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                  {/* Error fallback (hidden by default) */}
                  <div
                    className="w-full items-center justify-center bg-gray-100 text-gray-400 text-xs"
                    style={{ height: "140px", display: "none" }}
                  >
                    Failed to load image preview
                  </div>

                  {/* Overlay with status */}
                  <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/60 text-white text-xs px-2.5 py-1 rounded-md backdrop-blur-sm">
                    <CheckCircleOutlined style={{ fontSize: "11px" }} />
                    Image set
                  </div>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => handleEditFormChange("cover_image", "")}
                    className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-red-500 transition-all duration-200 opacity-0 group-hover:opacity-100"
                    aria-label="Remove cover image"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
            {/* ==================== END COVER IMAGE SECTION ==================== */}

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <Select
                value={editForm.category || undefined}
                onChange={(value) => handleEditFormChange("category", value)}
                placeholder="Select a category"
                className="w-full"
                size="large"
                status={editErrors.category ? "error" : ""}
                getPopupContainer={(trigger) => trigger.parentNode}
              >
                {editCategories.map((cat) => (
                  <Option key={cat.value} value={cat.value}>
                    {cat.label}
                  </Option>
                ))}
              </Select>
              {editErrors.category && (
                <p className="mt-1 text-xs text-red-500">
                  {editErrors.category}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={editForm.description}
                onChange={(e) =>
                  handleEditFormChange("description", e.target.value)
                }
                placeholder="Write your blog description..."
                rows={5}
                className={`w-full px-4 py-2.5 rounded-lg border text-sm text-gray-800 placeholder-gray-400 outline-none transition-all duration-200 resize-none focus:ring-2 focus:ring-[#295557]/20 focus:border-[#295557] ${
                  editErrors.description
                    ? "border-red-400 bg-red-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              />
              {editErrors.description && (
                <p className="mt-1 text-xs text-red-500">
                  {editErrors.description}
                </p>
              )}
            </div>

            {/* Quote Section */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-4 border border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider m-0">
                Quote (Optional)
              </p>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Quote Text
                </label>
                <textarea
                  value={editForm.quote_text}
                  onChange={(e) =>
                    handleEditFormChange("quote_text", e.target.value)
                  }
                  placeholder="Enter an inspiring quote..."
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white hover:border-gray-300 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all duration-200 resize-none focus:ring-2 focus:ring-[#295557]/20 focus:border-[#295557]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Quote Author
                </label>
                <input
                  type="text"
                  value={editForm.quote_author}
                  onChange={(e) =>
                    handleEditFormChange("quote_author", e.target.value)
                  }
                  placeholder="e.g. Arab Traveler"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white hover:border-gray-300 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-[#295557]/20 focus:border-[#295557]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Footer Buttons */}
        <div
          style={{
            position: "sticky",
            bottom: 0,
            background: "#fff",
            padding: "16px 24px 20px 24px",
            borderTop: "1px solid #f3f4f6",
            zIndex: 10,
          }}
        >
          <div className="flex gap-3">
            <button
              onClick={handleEditCancel}
              disabled={editing || uploading}
              className="flex-1 px-5 py-2.5 border-2 border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleEditConfirm}
              disabled={editing || uploading}
              className="flex-1 px-5 py-2.5 bg-[#295557] text-white font-medium rounded-lg hover:bg-[#1e3e40] transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              {editing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <EditOutlined style={{ fontSize: "14px" }} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default page;
