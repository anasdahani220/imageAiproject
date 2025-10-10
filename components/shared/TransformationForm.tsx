"use client"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { aspectRatioOptions, defaultValues, transformationTypes } from "@/constants"
import { CustomField } from "./CustomField"
import { useState, useTransition } from "react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Value } from "@radix-ui/react-select"
import { AspectRatioKey, debounce, deepMergeObjects } from "@/lib/utils"
import MediaUploader from "./MediaUploader"

export const formSchema = z.object({
    title: z.string(),
    aspectRatio: z.string().optional(),
    color: z.string().optional(),
    prompt: z.string().optional(),
    publicId: z.string(),
});

const TransformationForm = ({ data = null, action, userId, type, creditBalance, config = null }: TransformationFormProps) => {
    const transformation = transformationTypes[type];
    const [image, setIamge] = useState(data);
    const [newTransformation, setNewTransformation] = useState<Transformations | null>(null)
    const [isSubmeting, setisSubmeting] = useState(false);
    const [isTransforming, setisTransforming] = useState(false);
    const [transformationConfig, settransformationConfig] = useState(config)
    const [isPending, settransition] = useTransition();
    const initialValues = data && action === 'Update' ? {
        title: data?.title,
        aspectRatio: data?.aspectRatio,
        color: data?.color,
        prompt: data?.prompt,
        publicId: data?.publicId,
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
    const onSelectFieldHandler = (value: string, onChangeField: (value: string) => void) => {
        const sizeImage = aspectRatioOptions[value as AspectRatioKey];
        setIamge((prevState: any) => ({
            ...prevState,
            aspectRatio: sizeImage.aspectRatio,
            width: sizeImage.width,
            height: sizeImage.height,
        }))
        setNewTransformation(transformation.config);
        return onChangeField(value);
    }
    const onInputChangeHandler = (fieldName: string, value: string, type: string, onChangeField: (value: string) => void) => {
        debounce(() => {
            setNewTransformation((prevState: any) => ({
                ...prevState,
                [type]: {
                    ...prevState?.[type],
                    [fieldName === 'prompt' ? 'prompt' : 'to']:
                        value,
                }
            }))
            return onChangeField(value)
        }, 1000);
    }
    const onTransformHandler = async () => {
        setisTransforming(true);
        settransformationConfig(deepMergeObjects(newTransformation, transformationConfig));
        setNewTransformation(null);
    }
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <CustomField
                    control={form.control}
                    name="title"
                    formLabel="Image title"
                    className="w-full"
                    render={({ field }) => <Input {...field} className="input-field" />} />
                {type === 'fill' && (
                    <CustomField
                        control={form.control}
                        name="aspectRatio"
                        formLabel="Aspect Ratio"
                        className="w-full"
                        render={({ field }) => (
                            <Select onValueChange={(value) => onSelectFieldHandler(value, field.onChange)}>
                                <SelectTrigger className="select-field">
                                    <SelectValue placeholder="Select size" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.keys(aspectRatioOptions).map((key) => (
                                        <SelectItem key={key} value={key} className="select-item">
                                            {aspectRatioOptions[key as AspectRatioKey].label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )} />
                )}
                {(type === 'recolor' || type === 'remove') && (
                    <div className="prompt-field">
                        <CustomField
                            control={form.control}
                            name="prompt"
                            formLabel={type === 'recolor' ? 'Object to Recolor' : 'Object to Remove'}
                            render={({ field }) =>
                                <Input
                                    value={field.value}
                                    className="input-field"
                                    onChange={(e) => onInputChangeHandler(
                                        'prompt',
                                        e.target.value,
                                        type,
                                        field.onChange
                                    )}
                                />}
                        />
                        {type === 'recolor' && (
                            <CustomField
                                control={form.control}
                                name="color"
                                formLabel="Replacement Color"
                                render={({ field }) => (
                                    <Input
                                        value={field.value}
                                        className="input-field"
                                        onChange={(e) => onInputChangeHandler(
                                            'color',
                                            e.target.value,
                                            'recolor',
                                            field.onChange,
                                        )} />
                                )} />
                        )}
                    </div>
                )}

                <div className="media-uploader-field"> 
                  <CustomField 
                    control={form.control}
                    name="publicId"
                    className="flex size-full flex-col"
                    render={({field}) => (
                        <MediaUploader 
                          onValueChange={field.onChange}
                          setImage={setIamge}
                          publicId={field.value}
                          image={image}
                          type={type}/>
                    )}/>
                </div>
                <div className="flex flex-col gap-4">
                    <Button type="button" className="submit-button capitalize"
                        disabled={isSubmeting || newTransformation === null}
                        onClick={onTransformHandler}
                    >{isTransforming ? 'transforming...' : 'Aply Transformation'}
                    </Button>
                    <Button type="submit" className="submit-button capitalize"
                        disabled={isSubmeting}
                    >{isSubmeting ? 'Submiting' : 'Save Image'}
                    </Button>
                </div>
            </form>
        </Form>
    )
}

export default TransformationForm;