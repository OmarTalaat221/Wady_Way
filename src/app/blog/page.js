"use client";
import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  memo,
  Suspense,
  lazy,
} from "react";
import axios from "axios";
import Breadcrumb from "@/components/common/Breadcrumb";
import Link from "next/link";
import { base_url } from "../../uitils/base_url";

const Newslatter = lazy(() => import("@/components/common/Newslatter"));
const Footer = lazy(() => import("@/components/footer/Footer"));

// ─── Skeleton Loader ───
const BlogCardSkeleton = memo(() => (
  <div className="col-lg-4 col-md-6">
    <div className="blog-card animate-pulse">
      <div className="bg-gray-200 rounded-t-lg" style={{ height: "370px" }} />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  </div>
));
BlogCardSkeleton.displayName = "BlogCardSkeleton";

const LoadingGrid = memo(() => (
  <div className="row g-md-4 gy-5 mb-[70px]">
    {Array.from({ length: 6 }).map((_, i) => (
      <BlogCardSkeleton key={i} />
    ))}
  </div>
));
LoadingGrid.displayName = "LoadingGrid";

// ─── Empty State ───
const EmptyState = memo(({ activeFilter, activeCategoryName, onReset }) => (
  <div className="col-12">
    <div className="text-center py-20">
      <div className="mb-4">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <h4 className="text-gray-500 mb-2">No official blogs found</h4>
      <p className="text-gray-400">
        {activeFilter !== "all" && activeCategoryName
          ? `No official blogs found in "${activeCategoryName}" category.`
          : "No official blogs available at the moment."}
      </p>
      {activeFilter !== "all" && (
        <button
          onClick={onReset}
          className="mt-4 px-6 py-2 bg-[#295557] text-white rounded-full hover:bg-[#1e3d3f] transition-colors"
        >
          View All Blogs
        </button>
      )}
    </div>
  </div>
));
EmptyState.displayName = "EmptyState";

// ─── Blog Card ───
const AdminBlogCard = memo(({ blog }) => {
  const date = useMemo(() => {
    const d = new Date(blog.created_at);
    return {
      day: d.getDate(),
      month: d.toLocaleDateString("en-US", { month: "short" }),
    };
  }, [blog.created_at]);

  const readTime = useMemo(() => {
    const words = blog.title ? blog.title.split(" ").length : 0;
    return Math.max(1, Math.ceil(words / 50));
  }, [blog.title]);

  const truncatedTitle = useMemo(() => {
    if (!blog.title) return "";
    return blog.title.length > 60
      ? blog.title.substring(0, 60) + "..."
      : blog.title;
  }, [blog.title]);

  const detailHref = `/blog/blog-details?blog_id=${blog.blog_id}`;

  return (
    <div className="col-lg-4 col-md-6">
      <article className="blog-card relative">
        {/* Admin Badge */}
        <div className="absolute top-4 right-4 z-10">
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-[#295557] to-[#e8a355] text-white text-xs font-semibold rounded-full shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={14}
              height={14}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
            </svg>
            Official
          </span>
        </div>

        <div className="blog-card-img-wrap">
          <Link
            href={detailHref}
            className="card-img"
            aria-label={`Read ${blog.title}`}
          >
            <img
              src={blog.cover_image || "/assets/img/blog/default-blog.jpg"}
              alt={blog.title || "Blog post"}
              style={{ height: "370px", objectFit: "cover", width: "100%" }}
              loading="lazy"
              decoding="async"
              onError={(e) => {
                e.target.src = "/assets/img/blog/default-blog.jpg";
              }}
            />
          </Link>
          <Link
            href="/blog"
            className="date"
            aria-label={`Posted on ${date.month} ${date.day}`}
          >
            <span>
              <strong>{date.day}</strong> <br />
              {date.month}
            </span>
          </Link>
        </div>
        <div className="blog-card-content">
          <div className="blog-card-content-top">
            <ul>
              <li>
                By <Link href={detailHref}>{blog.admin_name || "Admin"}</Link>
              </li>
              <li>
                <Link href={detailHref}>
                  {blog.category_name || "Uncategorized"}
                </Link>
              </li>
            </ul>
          </div>
          <h5 className="line-clamp-1">
            <Link href={detailHref}>{truncatedTitle}</Link>
          </h5>
          <div className="bottom-area">
            <Link href={detailHref}>
              Read More
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={14}
                  height={12}
                  viewBox="0 0 14 12"
                  fill="none"
                  aria-hidden="true"
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
                aria-hidden="true"
              >
                <path d="M5.85726 11.3009C7.14547 9.08822 6.60613 6.30362 4.57475 4.68025C4.57356 4.67933 4.57238 4.67818 4.57143 4.6775L4.58021 4.69862L4.57878 4.71446C4.97457 5.72599 4.91905 6.83648 4.43285 7.78924L4.09022 8.461L3.9851 7.71876C3.91368 7.21529 3.71745 6.735 3.41515 6.32382H3.36745L3.3423 6.25495C3.34586 7.02428 3.17834 7.78213 2.8497 8.49704C2.41856 9.43259 2.48191 10.5114 3.01936 11.3833L3.39023 11.9853L2.72299 11.7126C1.62271 11.2628 0.743103 10.3964 0.309587 9.33547C-0.176131 8.15083 -0.0862008 6.77725 0.550429 5.66194C0.882388 5.08179 1.11493 4.46582 1.24187 3.8308L1.36597 3.2084L1.68251 3.76353C1.83366 4.02824 1.94494 4.31476 2.01399 4.61574L2.02111 4.62285L2.02847 4.67107L2.03535 4.669C2.98353 3.45015 3.55158 1.93354 3.6344 0.397865L3.65575 0L4.00076 0.217643C5.4088 1.10544 6.38664 2.52976 6.6887 4.13017L6.69558 4.163L6.69914 4.16805L6.71457 4.14693C6.99053 3.79429 7.13622 3.37485 7.13622 2.93336V2.24967L7.56261 2.7947C8.55398 4.06153 9.06224 5.63301 8.99391 7.21988C8.90991 9.08776 7.85708 10.7272 6.17736 11.6154L5.45008 12L5.85726 11.3009Z" />
              </svg>
              {readTime} Min Read
            </span>
          </div>
        </div>
      </article>
    </div>
  );
});
AdminBlogCard.displayName = "AdminBlogCard";

// ─── Category Filter Button ───
const CategoryFilterButton = memo(
  ({ categoryId, label, count, isActive, onClick }) => (
    <button
      onClick={() => onClick(categoryId)}
      className={`snap-center flex-shrink-0 relative px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-300 overflow-hidden whitespace-nowrap ${
        isActive
          ? "text-white transform hover:scale-105 active:scale-95"
          : "bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 hover:border-gray-300 transform hover:scale-105 active:scale-95"
      }`}
      style={
        isActive
          ? { background: "linear-gradient(135deg, #295557 0%, #e8a355 100%)" }
          : undefined
      }
      aria-pressed={isActive}
      aria-label={`Filter by ${label}, ${count} blogs`}
    >
      <span className="relative z-10">
        {label} ({count})
      </span>
      {isActive && (
        <>
          <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover/filter:scale-x-100 transition-transform duration-300 origin-left" />
          <div className="absolute inset-0 opacity-0 group-hover/filter:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white/15 to-transparent transform -skew-x-12 -translate-x-full group-hover/filter:translate-x-full" />
        </>
      )}
      {!isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 opacity-0 group-hover/filter:opacity-100 transition-opacity duration-300" />
      )}
    </button>
  )
);
CategoryFilterButton.displayName = "CategoryFilterButton";

// ─── Pagination ───
const PaginationBar = memo(
  ({ currentPage, totalPages, totalPosts, onPageChange }) => {
    const pages = useMemo(() => {
      const result = [];
      const maxVisible = 5;

      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) result.push(i);
      } else if (currentPage <= 3) {
        result.push(1, 2, 3, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        result.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
      } else {
        result.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
      return result;
    }, [currentPage, totalPages]);

    if (totalPages <= 1) return null;

    return (
      <div className="row">
        <div className="col-lg-12">
          <nav className="inner-pagination-area" aria-label="Blog pagination">
            <ul className="pagination-list">
              <li>
                <button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`shop-pagi-btn ${
                    currentPage === 1
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-100"
                  }`}
                  aria-label="Previous page"
                >
                  <i className="bi bi-chevron-left" aria-hidden="true" />
                </button>
              </li>
              {pages.map((page, index) => (
                <li key={index}>
                  {page === "..." ? (
                    <span
                      className="px-3 py-2 text-gray-400"
                      aria-hidden="true"
                    >
                      <i className="bi bi-three-dots" />
                    </span>
                  ) : (
                    <button
                      onClick={() => onPageChange(page)}
                      className={`px-3 py-2 rounded transition-colors duration-200 ${
                        currentPage === page
                          ? "active bg-[#295557] text-white"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                      aria-label={`Page ${page}`}
                      aria-current={currentPage === page ? "page" : undefined}
                    >
                      {page}
                    </button>
                  )}
                </li>
              ))}
              <li>
                <button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`shop-pagi-btn ${
                    currentPage === totalPages
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-100"
                  }`}
                  aria-label="Next page"
                >
                  <i className="bi bi-chevron-right" aria-hidden="true" />
                </button>
              </li>
            </ul>
            <div className="text-center mt-4">
              <span className="text-sm text-gray-500">
                Page {currentPage} of {totalPages} ({totalPosts} total official
                blogs)
              </span>
            </div>
          </nav>
        </div>
      </div>
    );
  }
);
PaginationBar.displayName = "PaginationBar";

// ═══════════════════════════════════════════
// ─── Main Page ───
// ═══════════════════════════════════════════
const AdminBlogsPage = () => {
  const [allBlogs, setAllBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 9;

  const [categories, setCategories] = useState([]);

  // Fetch blogs
  useEffect(() => {
    let cancelled = false;

    const fetchAdminBlogs = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${base_url}/user/admin_blogs/select_blogs.php`
        );

        if (cancelled) return;

        if (response.data.status === "success") {
          const blogs = response.data.message;
          setAllBlogs(blogs);
          setFilteredBlogs(blogs);

          const uniqueCategories = [];
          const seenIds = new Set();

          blogs.forEach((blog) => {
            const catId = blog.category;
            if (catId && !seenIds.has(catId)) {
              seenIds.add(catId);
              uniqueCategories.push({
                category_id: catId,
                category_name: blog.category_name || `Category ${catId}`,
              });
            }
          });

          setCategories(uniqueCategories);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Error fetching admin blogs:", error);
          setAllBlogs([]);
          setFilteredBlogs([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAdminBlogs();
    return () => {
      cancelled = true;
    };
  }, []);

  // Derived: display blogs
  const displayBlogs = useMemo(() => {
    const start = (currentPage - 1) * blogsPerPage;
    return filteredBlogs.slice(start, start + blogsPerPage);
  }, [filteredBlogs, currentPage, blogsPerPage]);

  const totalPages = useMemo(
    () => Math.ceil(filteredBlogs.length / blogsPerPage),
    [filteredBlogs.length, blogsPerPage]
  );

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { all: allBlogs.length };
    categories.forEach((cat) => {
      counts[cat.category_id] = allBlogs.filter(
        (blog) => blog.category === cat.category_id
      ).length;
    });
    return counts;
  }, [allBlogs, categories]);

  // Active category name
  const activeCategoryName = useMemo(() => {
    if (activeFilter === "all") return null;
    const cat = categories.find((c) => c.category_id === activeFilter);
    return cat?.category_name || activeFilter;
  }, [activeFilter, categories]);

  // Filter handler
  const filterBlogs = useCallback(
    (categoryId) => {
      setActiveFilter(categoryId);
      setCurrentPage(1);

      if (categoryId === "all") {
        setFilteredBlogs(allBlogs);
      } else {
        setFilteredBlogs(
          allBlogs.filter((blog) => blog.category === categoryId)
        );
      }
    },
    [allBlogs]
  );

  // Page change handler
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Reset filter handler
  const handleResetFilter = useCallback(
    () => filterBlogs("all"),
    [filterBlogs]
  );

  return (
    <>
      <Breadcrumb pagename="Official Blogs" pagetitle="Official Blogs" />

      <main className="blod-grid-section pt-[50px] mb-[20px]">
        <div className="container">
          {/* Header */}
          <div className="text-center mb-8">
            <p className="text-gray-600">
              Discover curated travel insights and tips from our expert team
            </p>
          </div>

          {/* ── Category Filters — Snap Scroll ── */}
          <div className="relative mb-16">
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white to-transparent z-10 hidden max-lg:block" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent z-10 hidden max-lg:block" />

            <nav
              className="flex gap-3 pb-3 overflow-x-auto snap-x snap-mandatory scroll-smooth
                         lg:flex-wrap lg:justify-center lg:overflow-x-visible lg:pb-0
                         scrollbar-none"
              aria-label="Blog category filters"
              style={{
                WebkitOverflowScrolling: "touch",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              <div className="flex-shrink-0 w-1 lg:hidden" aria-hidden="true" />

              <CategoryFilterButton
                categoryId="all"
                label="All"
                count={categoryCounts.all || 0}
                isActive={activeFilter === "all"}
                onClick={filterBlogs}
              />
              {categories.map((category) => (
                <CategoryFilterButton
                  key={category.category_id}
                  categoryId={category.category_id}
                  label={category.category_name}
                  count={categoryCounts[category.category_id] || 0}
                  isActive={activeFilter === category.category_id}
                  onClick={filterBlogs}
                />
              ))}

              <div className="flex-shrink-0 w-1 lg:hidden" aria-hidden="true" />
            </nav>
          </div>

          {/* Results Counter */}
          <div className="text-center mb-6">
            <p className="text-gray-600">
              Showing {displayBlogs.length} of {filteredBlogs.length} official
              blogs
              {activeFilter !== "all" && activeCategoryName && (
                <>
                  {" "}
                  in "
                  <span className="font-semibold">{activeCategoryName}</span>"
                </>
              )}
            </p>
          </div>

          {/* Content */}
          {loading ? (
            <LoadingGrid />
          ) : (
            <>
              <div className="row g-md-4 gy-5 mb-[70px]">
                {displayBlogs.length > 0 ? (
                  displayBlogs.map((blog) => (
                    <AdminBlogCard key={blog.blog_id} blog={blog} />
                  ))
                ) : (
                  <EmptyState
                    activeFilter={activeFilter}
                    activeCategoryName={activeCategoryName}
                    onReset={handleResetFilter}
                  />
                )}
              </div>

              <PaginationBar
                currentPage={currentPage}
                totalPages={totalPages}
                totalPosts={filteredBlogs.length}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </main>

      <Suspense fallback={<div className="h-[200px]" />}>
        <Newslatter />
      </Suspense>
      <Suspense fallback={<div className="h-[300px]" />}>
        <Footer />
      </Suspense>
    </>
  );
};

export default AdminBlogsPage;
