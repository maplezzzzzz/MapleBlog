import type { SearchableEntry } from "@/types";
import React, { useEffect, useRef, useState } from "react";
import { plainify } from "@lib/textConverter";
import Fuse from "fuse.js";

const descriptionLength = 100;

interface Props {
  searchList: SearchableEntry[];
}

interface SearchResult {
  item: SearchableEntry;
  refIndex: number;
}

const getPath = (entry: SearchableEntry) => {
  return `${entry.collection}/${entry.id.replace("-index", "")}`;
};

const SearchPage = ({ searchList }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputVal, setInputVal] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
    setInputVal(e.currentTarget.value);
  };

  const fuse = new Fuse(searchList, {
    keys: ["data.title", "data.description", "id", "collection", "body"],
    includeMatches: true,
    minMatchCharLength: 2,
    threshold: 0.5,
  });

  useEffect(() => {
    const searchUrl = new URLSearchParams(window.location.search);
    const searchStr = searchUrl.get("q");
    if (searchStr) setInputVal(searchStr);

    // 优化：使用requestAnimationFrame替代setTimeout，提升性能
    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.selectionStart = inputRef.current.selectionEnd =
          searchStr?.length || 0;
      }
    });
  }, []);

  useEffect(() => {
    let inputResult = inputVal.length >= 2 ? fuse.search(inputVal) : [];
    setSearchResults(inputResult);

    if (inputVal.length >= 2) {
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set("q", inputVal);
      const newRelativePathQuery =
        window.location.pathname + "?" + searchParams.toString();
      history.pushState(null, "", newRelativePathQuery);
    } else {
      history.pushState(null, "", window.location.pathname);
      setSearchResults([]);
    }
  }, [inputVal]);

  return (
    <section className="">
      <div className="container px-3 lg:px-8">
        <div className="row mb-10 justify-center">
          <div className="col-10 lg:col-8 px-0">
            <div className="flex flex-nowrap">
              <input
                className="w-full glass rounded-[35px] p-6 text-txt-p placeholder:text-txt-light dark:placeholder:text-darkmode-txt-light focus:border-darkmode-border focus:ring-transparent dark:text-darkmode-txt-light intersect:animate-fadeDown opacity-0 intersect-no-queue"
                placeholder="搜点什么"
                type="search"
                name="search"
                value={inputVal}
                onChange={handleChange}
                autoComplete="off"
                autoFocus
                ref={inputRef}
              />
            </div>
          </div>
        </div>
        <div className="row">
          {searchResults?.length < 1 ? (
            <div className="col-10 lg:col-8 mx-auto p-2 text-center glass rounded-[35px] intersect:animate-fadeUp opacity-0">
              <p id="no-result">
                {inputVal.length < 1
                  ? "“嗖”的一下，就搜出来了！"
                  : inputVal.length < 2
                    ? "请输入2个以上字符"
                    : "我没找到呢，试试其他关键词"}
              </p>
            </div>
          ) : (
            searchResults?.map(({ item }, index) => (
              <div className="py-2 px-0" key={`search-${index}`}>
                <div className="h-full glass col-10 lg:col-8 mx-auto rounded-[35px] p-6 intersect:animate-fade opacity-0">
                  <h4 className="mb-2">
                    <a href={"/" + getPath(item)}>{item.data.title}</a>
                  </h4>
                  {item.data.description && (
                    <p className="">{item.data.description}</p>
                  )}
                  {!item.data.description && item.body && (
                    <p className="">
                      {plainify(item.body.slice(0, descriptionLength))}
                    </p>
                  )}
                  {item.data.createdAt && (
                    <p className="text-txt-light dark:text-darkmode-txt-light">
                      {new Date(item.data.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default SearchPage;
