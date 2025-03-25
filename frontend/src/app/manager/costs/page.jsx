"use client";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import FileUpload from "@/components/ui/file-upload";
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField
} from "@/components/ui/form";
import data from "../data.json";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { CostDocumentsTable } from "@/components/cost-documets-table";
export default function Page() {
  // const form = useForm();
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 px-4 md:gap-6 lg:py-6 lg:px-6">
          {/* <Form>
            <form>
              <FormField
                // control={form.control}
                name="file"
                render={() => (
                  <FormItem>
                    <FormLabel>Plik importu</FormLabel>
                    <FormControl>
                      <FileUpload></FileUpload>
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Submit</Button>
            </form>
          </Form> */}

          {/* <div className="px-4">
            <FileUpload></FileUpload>
          </div> */}
          <CostDocumentsTable data={data} />
        </div>
      </div>
    </div>
  );
}
