import { SearchResultPageContent } from '@/components/consumer/SearchResultPageContent';

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    keyword?: string;
    categoryId?: string;
    page?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

function getSearchKeyword(
  searchParams: Awaited<SearchPageProps['searchParams']>
): string {
  return (searchParams.q ?? searchParams.keyword ?? '').trim();
}

function getSearchPage(
  searchParams: Awaited<SearchPageProps['searchParams']>
): number {
  const page = Number(searchParams.page);

  if (!Number.isInteger(page) || page < 1) {
    return 1;
  }

  return page;
}

function getSearchPrice(value: string | undefined): number | undefined {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    return undefined;
  }

  const price = Number(trimmedValue);

  if (!Number.isInteger(price) || price < 0) {
    return undefined;
  }

  return price;
}

function getSearchPageKey(
  searchParams: Awaited<SearchPageProps['searchParams']>
): string {
  return new URLSearchParams(
    Object.entries(searchParams).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string'
    )
  ).toString();
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <SearchResultPageContent
      key={getSearchPageKey(resolvedSearchParams)}
      initialKeyword={getSearchKeyword(resolvedSearchParams)}
      initialCategoryId={resolvedSearchParams.categoryId}
      initialPage={getSearchPage(resolvedSearchParams)}
      initialSortOption={resolvedSearchParams.sort}
      initialMinPrice={getSearchPrice(resolvedSearchParams.minPrice)}
      initialMaxPrice={getSearchPrice(resolvedSearchParams.maxPrice)}
    />
  );
}
