import { Link } from "react-router-dom"
import { Page, PageHeader } from "@/components/site/motion"

export default function NotFoundPage() {
  return (
    <Page className="min-h-[80vh]">
      <PageHeader eyebrow="404" title="This page isn't being watched." lead="It doesn't exist, or it moved.">
        <Link to="/" className="mt-2 inline-flex min-h-12 items-center self-start rounded-full bg-white px-6 font-semibold text-neutral-950">
          Back to home
        </Link>
      </PageHeader>
    </Page>
  )
}
