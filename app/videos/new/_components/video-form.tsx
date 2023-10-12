"use client";

import {
  ValidationError as CreateVideoValidationError,
  createVideo,
} from "@/actions/create-video";
import {
  ValidationError as FetchPagedataValidationError,
  fetchPagedata,
} from "@/actions/fetch-pagedata";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { Button, Form, InputGroup, Stack } from "react-bootstrap";

export function VideoForm({ callbackUrl }: { callbackUrl?: string }) {
  const router = useRouter();

  const urlFieldRef = useRef<HTMLInputElement>(null);

  const [validationError, setValidationError] = useState<
    (FetchPagedataValidationError & CreateVideoValidationError) | undefined
  >(undefined);

  const [title, setTitle] = useState<string | undefined>(undefined);

  const [keywords, setKeywords] = useState<string[] | undefined>(undefined);

  const [selectedKeywords, setSelectedKeywords] = useState<
    string[] | undefined
  >(undefined);

  const [imageUrls, setImageUrls] = useState<string[] | undefined>(undefined);

  const [selectedImageUrl, setSelectedImageUrl] = useState<string | undefined>(
    undefined,
  );

  const submit = useCallback(
    async (formData: FormData) => {
      if (selectedKeywords) {
        formData.append("keywords", selectedKeywords.join(","));
      }

      if (selectedImageUrl) {
        formData.append("imageUrl", selectedImageUrl);
      }

      const { validationError, errorMessage } = await createVideo(formData);

      if (!validationError && !errorMessage) {
        router.push(callbackUrl ?? "/videos");
        router.refresh();

        return;
      }

      setValidationError(validationError);
    },
    [callbackUrl, router, selectedImageUrl, selectedKeywords],
  );

  const fetchButtonClick = useCallback(async () => {
    const formData = new FormData();

    formData.append("url", urlFieldRef.current?.value ?? "");

    const { validationError, title, description, keywords, imageUrls } =
      await fetchPagedata(formData);

    setValidationError(validationError);
    setTitle(title);
    setKeywords(keywords);
    setSelectedKeywords(keywords);
    setImageUrls(imageUrls);
    setSelectedImageUrl(
      imageUrls && Array.isArray(imageUrls) && imageUrls.length > 0
        ? imageUrls[0]
        : undefined,
    );
  }, []);

  const keywordBadgeClick = useCallback(
    (keyword: string) => () => {
      if (selectedKeywords?.includes(keyword)) {
        setSelectedKeywords(
          selectedKeywords?.filter(
            (selectedKeyword) => selectedKeyword !== keyword,
          ),
        );
      } else {
        setSelectedKeywords([...(selectedKeywords ?? []), keyword]);
      }
    },
    [selectedKeywords],
  );

  const imageClick = useCallback(
    (index: number) => () => {
      setSelectedImageUrl(imageUrls?.[index]);
    },
    [imageUrls],
  );

  return (
    <form action={submit}>
      <Stack gap={3}>
        <Form.Group>
          <Form.Label>URL</Form.Label>

          <InputGroup>
            <Form.Control
              ref={urlFieldRef}
              name="url"
              isInvalid={!!validationError?.url}
            />

            <Button
              type="button"
              variant="outline-secondary"
              onClick={fetchButtonClick}
            >
              Fetch
            </Button>
          </InputGroup>

          <Form.Control.Feedback type="invalid" className="d-block">
            {validationError?.url?.map((message, index) => (
              <div key={`feedback-invalid-url-${index}`}>{message}</div>
            )) ?? null}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group>
          <Form.Label>Title</Form.Label>

          <Form.Control
            as="textarea"
            rows={2}
            name="title"
            defaultValue={title}
            isInvalid={!!validationError?.title}
          />

          <Form.Control.Feedback type="invalid" className="d-block">
            {validationError?.title?.map((message, index) => (
              <div key={`feedback-invalid-title-${index}`}>{message}</div>
            )) ?? null}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group>
          {keywords ? (
            <Stack direction="horizontal" gap={1} className="flex-wrap">
              {keywords.map((keyword, index) => (
                <Button
                  key={`keyword-${index}`}
                  type="button"
                  variant={
                    selectedKeywords?.includes(keyword)
                      ? "info"
                      : "outline-info"
                  }
                  size="sm"
                  onClick={keywordBadgeClick(keyword)}
                >
                  {keyword}
                </Button>
              ))}
            </Stack>
          ) : null}

          <Form.Control.Feedback type="invalid" className="d-block">
            {validationError?.keywords?.map((message, index) => (
              <div key={`feedback-invalid-keywords-${index}`}>{message}</div>
            )) ?? null}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group>
          {imageUrls ? (
            <Stack direction="horizontal" gap={1} className="flex-wrap">
              {imageUrls.map((imageUrl, index) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={`image-url-${index}`}
                  src={imageUrl}
                  alt={imageUrl}
                  width={120}
                  height={120}
                  onClick={imageClick(index)}
                  className="object-fit-contain border rounded"
                  style={{
                    width: "calc((100% - 0.5rem) / 2)",
                    ...(imageUrl === selectedImageUrl
                      ? {
                          outline: "solid 2px var(--bs-info)",
                          backgroundColor: "rgba(var(--bs-info-rgb),0.25)",
                        }
                      : {}),
                  }}
                />
              ))}
            </Stack>
          ) : null}

          <Form.Control.Feedback type="invalid" className="d-block">
            {validationError?.imageUrl?.map((message, index) => (
              <div key={`feedback-invalid-image-url-${index}`}>{message}</div>
            )) ?? null}
          </Form.Control.Feedback>
        </Form.Group>

        <hr />

        <button className="btn btn-primary">Submit</button>
      </Stack>
    </form>
  );
}
