"use client";

import NextLink from "next/link";
import React, { useEffect, useRef, useState } from "react";

const Link = ({ children, href, ...rest }) => {
  const [prefetching, setPrefetching] = useState(false);
  const linkRef = useRef(null);

  const setPrefetchListener = () => {
    setPrefetching(true);
  };

  const removePrefetchListener = () => {
    setPrefetching(false);
  };

  useEffect(() => {
    const linkElement = linkRef.current;
    linkElement?.addEventListener("mouseover", setPrefetchListener);
    linkElement?.addEventListener("mouseleave", removePrefetchListener);
    return () => {
      linkElement?.removeEventListener("mouseover", setPrefetchListener);
      linkElement?.removeEventListener("mouseleave", removePrefetchListener);
    };
  }, [prefetching]);

  return (
    <NextLink href={href} ref={linkRef} prefetch={prefetching} {...rest}>
      {children}
    </NextLink>
  );
};

export default Link;
