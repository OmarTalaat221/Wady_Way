"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Breadcrumb from "@/components/common/Breadcrumb";
import Link from "next/link";
import Newslatter from "@/components/common/Newslatter";
import Footer from "@/components/footer/Footer";
import Topbar from "@/components/topbar/Topbar";
import Header from "@/components/header/Header";
import { base_url } from "../../uitils/base_url";

const page = () => {
  const [allBlogs, setAllBlogs] = useState([]); // All blogs from API
  const [filteredBlogs, setFilteredBlogs] = useState([]); // Filtered blogs
  const [displayBlogs, setDisplayBlogs] = useState([]); // Blogs to display (paginated)
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 9;

  // Available categories - will be dynamic based on API data
  const [categories, setCategories] = useState(["All"]);

  // Add isLoggedIn state for showing Add Blog button
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login status on mount
  useEffect(() => {
    try {
      const user = localStorage.getItem("user");
      if (user) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      setIsLoggedIn(false);
    }
  }, []);

  // Fetch all blogs from API once
  const fetchAllBlogs = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${base_url}/user/blog/select_blogs.php`
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
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
      setAllBlogs([]);
      setFilteredBlogs([]);
      setDisplayBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter blogs by category (client-side)
  const filterBlogs = (category) => {
    setActiveFilter(category);
    setCurrentPage(1); // Reset to first page when filtering

    let filtered;
    if (category === "All") {
      filtered = allBlogs;
    } else {
      filtered = allBlogs.filter((blog) => blog.category === category);
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

  // Fetch data on component mount
  useEffect(() => {
    fetchAllBlogs();
  }, []);

  // Update pagination when filtered blogs change
  useEffect(() => {
    const startIndex = (currentPage - 1) * blogsPerPage;
    const endIndex = startIndex + blogsPerPage;
    setDisplayBlogs(filteredBlogs.slice(startIndex, endIndex));
  }, [filteredBlogs, currentPage]);

  const totalPages = getTotalPages();

  return (
    <>
      {/* <Topbar /> */}
      {/* <Header /> */}
      <Breadcrumb pagename="Blog Grid" pagetitle="Blog Grid" />
      <div className="blod-grid-section pt-[50px] mb-[20px]">
        <div className="container">
          {/* Add Blog Button for logged-in users */}
          {isLoggedIn && (
            <div className="text-center mb-8">
              <Link
                href="/blog/add-blog"
                className="inline-flex items-center px-6 py-3 bg-[#295557]  text-white font-medium rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={20}
                  height={20}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Add Blog
              </Link>
            </div>
          )}

          {/* Category Filter Buttons */}
          <div className="flex overflow-x-auto pb-2 snap-x no-scroll  flex-wrap justify-center gap-3 mb-16">
            {categories.map((filter) => (
              <button
                key={filter}
                onClick={() => filterBlogs(filter)}
                className={`group/filter snap-center relative px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-300 overflow-hidden ${
                  activeFilter === filter
                    ? "text-white shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                    : "bg-gray-50 hover:bg-gray-100 text-gray-700 shadow-sm hover:shadow-md border border-gray-200 hover:border-gray-300 transform hover:scale-105 active:scale-95"
                }`}
                style={
                  activeFilter === filter
                    ? {
                        background:
                          "linear-gradient(135deg, #295557 0%, #e8a355 100%)",
                      }
                    : {}
                }
              >
                <span className="relative z-10">
                  {filter}
                  {/* Show count for each category */}
                  {filter === "All"
                    ? ` (${allBlogs.length})`
                    : ` (${
                        allBlogs.filter((blog) => blog.category === filter)
                          .length
                      })`}
                </span>

                {/* Active button hover effects */}
                {activeFilter === filter && (
                  <>
                    <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover/filter:scale-x-100 transition-transform duration-300 origin-left" />
                    <div className="absolute inset-0 opacity-0 group-hover/filter:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white/15 to-transparent transform -skew-x-12 -translate-x-full group-hover/filter:translate-x-full" />
                  </>
                )}

                {/* Inactive button hover effect */}
                {activeFilter !== filter && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 opacity-0 group-hover/filter:opacity-100 transition-opacity duration-300" />
                )}
              </button>
            ))}
          </div>

          {/* Results Counter */}
          <div className="text-center mb-6">
            <p className="text-gray-600">
              Showing {displayBlogs.length} of {filteredBlogs.length} blogs
              {activeFilter !== "All" && ` in "${activeFilter}"`}
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
              <div className="row g-md-4 gy-5 mb-[70px]">
                {displayBlogs.length > 0 ? (
                  displayBlogs.map((blog) => {
                    const { day, month } = formatDate(blog.created_at);
                    const readTime = calculateReadTime(blog.title);

                    return (
                      <div key={blog.blog_id} className="col-lg-4 col-md-6">
                        <div className="blog-card">
                          <div className="blog-card-img-wrap">
                            <Link
                              href={`/blog/blog-details?blog_id=${blog.blog_id}`}
                              className="card-img"
                            >
                              <img
                                style={{ height: "370px", objectFit: "cover" }}
                                src={blog.cover_image}
                                alt={blog.title}
                                onError={(e) => {
                                  e.target.src =
                                    "/assets/img/blog/default-blog.jpg"; // Fallback image
                                }}
                              />
                            </Link>
                            <Link href="/blog" className="date">
                              <span>
                                <strong>{day}</strong> <br />
                                {month}
                              </span>
                            </Link>
                          </div>
                          <div className="blog-card-content">
                            <div className="blog-card-content-top">
                              <ul>
                                <li>
                                  By{" "}
                                  <Link href="/blog">
                                    {blog.user_data.full_name}
                                  </Link>
                                </li>
                                <li>
                                  <Link href="/blog">{blog.category}</Link>
                                </li>
                              </ul>
                            </div>
                            <h5>
                              <Link
                                href={`/blog/blog-details?blog_id=${blog.blog_id}`}
                              >
                                {blog.title.length > 60
                                  ? blog.title.substring(0, 60) + "..."
                                  : blog.title}
                              </Link>
                            </h5>
                            <div className="bottom-area">
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
                  <div className="col-12">
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
                      <p className="text-gray-400">
                        {activeFilter !== "All"
                          ? `No blogs found in "${activeFilter}" category. Try selecting "All" or another category.`
                          : "No blogs available at the moment."}
                      </p>
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
      <Newslatter />
      <Footer />
    </>
  );
};

export default page;
