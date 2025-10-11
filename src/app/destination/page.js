import Breadcrumb from "@/components/common/Breadcrumb";
import Link from "next/link";
import React from "react";

const page = () => {
  return (
    <>
      {/* <Breadcrumb pagename="destination" pagetitle="Destination" />
      <div className="destination-gallery-section pt-120 mb-120">
        <div className="container">
          <div className="row g-lg-4 gy-5 mb-[70px]">
            <div className="col-lg-3 col-sm-6">
              <div className="destination-card">
                <img src="https://res.cloudinary.com/dbz6ebekj/image/upload/v1740914407/agustin-diaz-gargiulo-7F65HDP0-E0-unsplash_fxx9vc.jpg" alt="" />
                <div className="overlay" />
                <div className="card-title">
                  <h4>Brazil</h4>
                </div>
                <div className="content">
                  <h4>
                    <Link href="/destination/destination-details">Brazil</Link>
                  </h4>
                  <div className="eg-tag">
                    <span>50 Tour</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-5 col-sm-6">
              <div className="destination-card">
                <img src="https://res.cloudinary.com/dbz6ebekj/image/upload/v1740914485/jack-ward-rknrvCrfS1k-unsplash_wlpbz5.jpg" alt="" />
                <div className="overlay" />
                <div className="card-title">
                  <h4>Italy</h4>
                </div>
                <div className="content">
                  <h4>
                    <Link href="/destination/destination-details">Italy</Link>
                  </h4>
                  <div className="eg-tag">
                    <span>30 Tour</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-sm-6">
              <div className="destination-card">
                <img src="https://res.cloudinary.com/dbz6ebekj/image/upload/v1740914578/michael-discenza-5omwAMDxmkU-unsplash_b11obo.jpg" alt="" />
                <div className="overlay" />
                <div className="card-title">
                  <h4>New York</h4>
                </div>
                <div className="content">
                  <h4>
                    <Link href="/destination/destination-details">
                      New York
                    </Link>
                  </h4>
                  <div className="eg-tag">
                    <span>30 Tour</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-sm-6">
              <div className="destination-card">
                <img src="https://res.cloudinary.com/dbz6ebekj/image/upload/v1740903193/chris-karidis-nnzkZNYWHaU-unsplash_iqwgll.jpg" alt="" />
                <div className="overlay" />
                <div className="card-title">
                  <h4>France</h4>
                </div>
                <div className="content">
                  <h4>
                    <Link href="/destination/destination-details">France</Link>
                  </h4>
                  <div className="eg-tag">
                    <span>35 Tour</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-sm-6">
              <div className="destination-card">
                <img src="https://res.cloudinary.com/dbz6ebekj/image/upload/v1740914823/roman-kraft-g_gwdpsCVAY-unsplash_ndk0gx.jpg" alt="" />
                <div className="overlay" />
                <div className="card-title">
                  <h4>Europe</h4>
                </div>
                <div className="content">
                  <h4>
                    <Link href="/destination/destination-details">Europe</Link>
                  </h4>
                  <div className="eg-tag">
                    <span>50 Tour</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-5 col-sm-6">
              <div className="destination-card">
                <img src="https://res.cloudinary.com/dbz6ebekj/image/upload/v1740912174/mohammed-alzubidi-fpl6kOWBA8Y-unsplash_es6ffq.jpg" alt="" />
                <div className="overlay" />
                <div className="card-title">
                  <h4>Saudi Arab</h4>
                </div>
                <div className="content">
                  <h4>
                    <Link href="/destination/destination-details">
                      Saudi Arab
                    </Link>
                  </h4>
                  <div className="eg-tag">
                    <span>30 Tour</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-sm-6">
              <div className="destination-card">
                <img src="https://res.cloudinary.com/dbz6ebekj/image/upload/v1740914873/manuel-cosentino-n--CMLApjfI-unsplash_hpknxu.jpg" alt="" />
                <div className="overlay" />
                <div className="card-title">
                  <h4>Japan</h4>
                </div>
                <div className="content">
                  <h4>
                    <Link href="/destination/destination-details">Japan</Link>
                  </h4>
                  <div className="eg-tag">
                    <span>40 Tour</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-5 col-sm-6">
              <div className="destination-card">
                <img src="https://res.cloudinary.com/dbz6ebekj/image/upload/v1740912137/tron-le-aAn-_iTks4E-unsplash_vijiov.jpg" alt="" />
                <div className="overlay" />
                <div className="card-title">
                  <h4>Switzerland</h4>
                </div>
                <div className="content">
                  <h4>
                    <Link href="/destination/destination-details">
                      Switzerland
                    </Link>
                  </h4>
                  <div className="eg-tag">
                    <span>30 Tour</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-sm-6">
              <div className="destination-card">
                <img src="https://res.cloudinary.com/dbz6ebekj/image/upload/v1740915008/caleb-JmuyB_LibRo-unsplash_dsihsn.jpg" alt="" />
                <div className="overlay" />
                <div className="card-title">
                  <h4>Australia</h4>
                </div>
                <div className="content">
                  <h4>
                    <Link href="/destination/destination-details">
                      Australia
                    </Link>
                  </h4>
                  <div className="eg-tag">
                    <span>30 Tour</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-12">
              <nav className="inner-pagination-area">
                <ul className="pagination-list">
                  <li>
                    <a href="#" className="shop-pagi-btn">
                      <i className="bi bi-chevron-left" />
                    </a>
                  </li>
                  <li>
                    <a href="#">1</a>
                  </li>
                  <li>
                    <a href="#" className="active">
                      2
                    </a>
                  </li>
                  <li>
                    <a href="#">3</a>
                  </li>
                  <li>
                    <a href="#">
                      <i className="bi bi-three-dots" />
                    </a>
                  </li>
                  <li>
                    <a href="#">6</a>
                  </li>
                  <li>
                    <a href="#" className="shop-pagi-btn">
                      <i className="bi bi-chevron-right" />
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div> */}
    </>
  );
};

export default page;
