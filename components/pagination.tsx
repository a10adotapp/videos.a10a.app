"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function Pagination({
  totalPage,
  currentPage,
}: {
  totalPage: number;
  currentPage: number;
}) {
  const router = useRouter();

  const searchParams = useSearchParams();

  const onItemClick = useCallback(
    (page: number) => () => {
      const newSearchParams = new URLSearchParams(searchParams);

      newSearchParams.set("page", `${page}`);

      router.push(`?${newSearchParams.toString()}`);
      router.refresh();
    },
    [router, searchParams],
  );

  return (
    <nav style={{ overflowX: "scroll" }}>
      <ul className="pagination pagination-sm">
        {Array.from({ length: totalPage }).map((_, index) => (
          <li
            key={index}
            className={[
              "page-item",
              ...(currentPage === index + 1 ? ["active"] : []),
            ].join(" ")}
          >
            <button className="page-link" onClick={onItemClick(index + 1)}>
              {index + 1}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
