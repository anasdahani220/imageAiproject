"use client"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {Form} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { defaultValues } from "@/constants"
import { CustomField } from "./CustomField"


export const formSchema = z.object({
    title: z.string(),
    aspectRatio: z.string().optional(),
    color: z.string().optional(),
    prompt: z.string().optional(),
    publicId: z.string(),
});

const TransformationForm = ({ data, action }: TransformationFormProps) => {
    const initialValues = data && action === 'Update' ? {
        title: data?.title,
        aspectRatio: data?.aspectRatio,
        color:data?.color,
        prompt: data?.prompt,
        publicId:data?.publicId,
    } : defaultValues;
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialValues,
    })

    // 2. Define a submit handler.
    function onSubmit(values: z.infer<typeof formSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log(values)
    }
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <CustomField 
                  control={form.control}
                  name="title"
                  formLabel="Image title"
                  className="w-full"
                  render={({field}) => <Input {...field} className="input-field"/>}/>
            <Button type="submit">Submit</Button>
            </form>
        </Form>
    )
}

export default TransformationForm;