"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Breadcrumb from "@/components/common/Breadcrumb";
import Link from "next/link";
import { Select, Tooltip } from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { base_url } from "../../../uitils/base_url";

const { Option } = Select;

const page = () => {
  const [allBlogs, setAllBlogs] = useState([]); // All blogs from API
  const [filteredBlogs, setFilteredBlogs] = useState([]); // Filtered blogs
  const [displayBlogs, setDisplayBlogs] = useState([]); // Blogs to display (paginated)
  const [activeFilter, setActiveFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 6; // Reduced for 2-column layout

  // Available categories - will be dynamic based on API data
  const [categories, setCategories] = useState(["All"]);

  // Add isLoggedIn state and user data
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  // Status options
  const statusOptions = [
    { label: "All Status", value: "All" },
    { label: "Published", value: "published" },
    { label: "Draft", value: "draft" },
    { label: "Hidden", value: "hidden" },
  ];

  // Check login status on mount
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

  // Fetch user blogs from API
  const fetchUserBlogs = async () => {
    if (!userData?.user_id && !userData?.id) return;

    setLoading(true);
    try {
      const response = await axios.post(
        `${base_url}/user/blog/user_blogs.php`,
        {
          user_id: userData.user_id || userData.id,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        const blogs = response.data.message;
        setAllBlogs(blogs);
        setFilteredBlogs(blogs);

        // Extract unique categories from API data
        const uniqueCategories = [
          "All",
          ...new Set(blogs.map((blog) => blog.category)),
        ];
        setCategories(uniqueCategories);

        // Set initial display (first page)
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

  // Filter blogs by category and status
  const filterBlogs = (category = activeFilter, status = statusFilter) => {
    setActiveFilter(category);
    setStatusFilter(status);
    setCurrentPage(1); // Reset to first page when filtering

    let filtered = allBlogs;

    // Filter by category
    if (category !== "All") {
      filtered = filtered.filter((blog) => blog.category === category);
    }

    // Filter by status
    if (status !== "All") {
      filtered = filtered.filter((blog) => blog.status === status);
    }

    setFilteredBlogs(filtered);
    // Update display with first page of filtered results
    setDisplayBlogs(filtered.slice(0, blogsPerPage));
  };

  // Handle pagination (client-side)
  const handlePageChange = (page) => {
    setCurrentPage(page);

    const startIndex = (page - 1) * blogsPerPage;
    const endIndex = startIndex + blogsPerPage;
    const paginatedBlogs = filteredBlogs.slice(startIndex, endIndex);

    setDisplayBlogs(paginatedBlogs);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Calculate total pages based on filtered blogs
  const getTotalPages = () => {
    return Math.ceil(filteredBlogs.length / blogsPerPage);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString("en-US", { month: "short" });
    return { day, month };
  };

  // Calculate read time based on title length (mock calculation)
  const calculateReadTime = (title) => {
    const words = title.split(" ").length;
    return Math.max(1, Math.ceil(words / 50)); // Assuming 50 words per minute
  };

  // Generate pagination numbers
  const generatePaginationNumbers = () => {
    const totalPages = getTotalPages();
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
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

  // Get status badge
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

  // Handle blog click based on status
  const handleBlogClick = (blog, e) => {
    if (blog.status !== "published") {
      e.preventDefault();
      if (blog.status === "draft") {
        alert("This blog is still in draft mode and awaiting admin approval.");
      } else if (blog.status === "hidden") {
        alert("This blog is currently hidden from public view.");
      }
    }
  };

  // Fetch data when userData is available
  useEffect(() => {
    if (userData) {
      fetchUserBlogs();
    }
  }, [userData]);

  // Update pagination when filtered blogs change
  useEffect(() => {
    const startIndex = (currentPage - 1) * blogsPerPage;
    const endIndex = startIndex + blogsPerPage;
    setDisplayBlogs(filteredBlogs.slice(startIndex, endIndex));
  }, [filteredBlogs, currentPage]);

  const totalPages = getTotalPages();

  // If not logged in, show login message
  if (!isLoggedIn) {
    return (
      <>
        {/* <Breadcrumb pagename="My Blogs" pagetitle="My Blogs" /> */}
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
              Please login to view your blogs.
            </p>
            <Link
              href="/login"
              className="w-full inline-block bg-[#e8a355] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#295557] transition-colors duration-300"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* <Breadcrumb pagename="My Blogs" pagetitle="My Blogs" /> */}

      <div className="blod-grid-section pt-0 mb-[20px]">
        <div className="container">
          {/* Header Section with Filters and Add Blog Button */}
          <div className="mb-8">
            {/* Mobile Layout */}
            <div className="block lg:hidden space-y-4">
              <div className="text-center">
                <Link
                  href="/blog/add-blog"
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
                    {categories.map((category) => (
                      <Option key={category} value={category}>
                        {category}
                        {category === "All"
                          ? ` (${allBlogs.length})`
                          : ` (${
                              allBlogs.filter(
                                (blog) => blog.category === category
                              ).length
                            })`}
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
                    {categories.map((category) => (
                      <Option key={category} value={category}>
                        {category}
                        {category === "All"
                          ? ` (${allBlogs.length})`
                          : ` (${
                              allBlogs.filter(
                                (blog) => blog.category === category
                              ).length
                            })`}
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
                  {" "}
                  {/* Add margin to align with labels */}
                  <Link
                    href="/blog/add-blog"
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
              {/* Blog Cards - Max 2 columns because of sidebar */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-[70px]">
                {displayBlogs.length > 0 ? (
                  displayBlogs.map((blog) => {
                    const { day, month } = formatDate(blog.created_at);
                    const readTime = calculateReadTime(blog.title);

                    return (
                      <div key={blog.blog_id} className="w-full">
                        <div className="blog-card h-full">
                          <div className="blog-card-img-wrap relative">
                            {blog.status === "published" ? (
                              <Link
                                href={`/blog/blog-details?blog_id=${blog.blog_id}`}
                                className="card-img"
                              >
                                <img
                                  style={{
                                    height: "280px",
                                    objectFit: "cover",
                                  }}
                                  src={blog.cover_image}
                                  alt={blog.title}
                                  onError={(e) => {
                                    e.target.src =
                                      "/assets/img/blog/default-blog.jpg"; // Fallback image
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
                                    objectFit: "cover",
                                    filter:
                                      blog.status !== "published"
                                        ? "grayscale(50%)"
                                        : "none",
                                  }}
                                  src={blog.cover_image}
                                  alt={blog.title}
                                  onError={(e) => {
                                    e.target.src =
                                      "/assets/img/blog/default-blog.jpg"; // Fallback image
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
                          </div>
                          <div className="blog-card-content">
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
                                    {blog.category}
                                  </span>
                                </li>
                              </ul>
                            </div>
                            <h5>
                              {blog.status === "published" ? (
                                <Link
                                  href={`/blog/blog-details?blog_id=${blog.blog_id}`}
                                >
                                  {blog.title.length > 80
                                    ? blog.title.substring(0, 80) + "..."
                                    : blog.title}
                                </Link>
                              ) : (
                                <span
                                  className="cursor-not-allowed text-gray-600"
                                  onClick={(e) => handleBlogClick(blog, e)}
                                >
                                  {blog.title.length > 80
                                    ? blog.title.substring(0, 80) + "..."
                                    : blog.title}
                                </span>
                              )}
                            </h5>
                            <div className="bottom-area">
                              {blog.status === "published" ? (
                                <Link
                                  href={`/blog/blog-details?blog_id=${blog.blog_id}`}
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
                              <span>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width={9}
                                  height={12}
                                  viewBox="0 0 9 12"
                                >
                                  <path d="M5.85726 11.3009C7.14547 9.08822 6.60613 6.30362 4.57475 4.68025C4.57356 4.67933 4.57238 4.67818 4.57143 4.6775L4.58021 4.69862L4.57878 4.71446C4.97457 5.72599 4.91905 6.83648 4.43285 7.78924L4.09022 8.461L3.9851 7.71876C3.91368 7.21529 3.71745 6.735 3.41515 6.32382H3.36745L3.3423 6.25495C3.34586 7.02428 3.17834 7.78213 2.8497 8.49704C2.41856 9.43259 2.48191 10.5114 3.01936 11.3833L3.39023 11.9853L2.72299 11.7126C1.62271 11.2628 0.743103 10.3964 0.309587 9.33547C-0.176131 8.15083 -0.0862008 6.77725 0.550429 5.66194C0.882388 5.08179 1.11493 4.46582 1.24187 3.8308L1.36597 3.2084L1.68251 3.76353C1.83366 4.02824 1.94494 4.31476 2.01399 4.61574L2.02111 4.62285L2.02847 4.67107L2.03535 4.669C2.98353 3.45015 3.55158 1.93354 3.6344 0.397865L3.65575 0L4.00076 0.217643C5.4088 1.10544 6.38664 2.52976 6.6887 4.13017L6.69558 4.163L6.69914 4.16805L6.71457 4.14693C6.99053 3.79429 7.13622 3.37485 7.13622 2.93336V2.24967L7.56261 2.7947C8.55398 4.06153 9.06224 5.63301 8.99391 7.21988C8.90991 9.08776 7.85708 10.7272 6.17736 11.6154L5.45008 12L5.85726 11.3009Z" />
                                </svg>
                                {readTime} Min Read
                              </span>
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
                        href="/blog/add-blog"
                        className="inline-flex items-center px-6 py-3 bg-[#e8a355] text-white font-medium rounded-lg hover:bg-[#295557] transition-colors duration-300"
                      >
                        <PlusOutlined className="mr-2" />
                        Create Your First Blog
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Pagination - Only show if there are multiple pages */}
              {totalPages > 1 && (
                <div className="row">
                  <div className="col-lg-12">
                    <nav className="inner-pagination-area">
                      <ul className="pagination-list">
                        {/* Previous Button */}
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

                        {/* Page Numbers */}
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

                        {/* Next Button */}
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

                      {/* Page Info */}
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
    </>
  );
};

export default page;
