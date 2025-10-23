"use client"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { aspectRatioOptions, creditFee, defaultValues, transformationTypes } from "@/constants"
import { CustomField } from "./CustomField"
import { startTransition, useEffect, useState, useTransition } from "react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { AspectRatioKey, debounce, deepMergeObjects, handleError } from "@/lib/utils"
import MediaUploader from "./MediaUploader"
import TransformedImage from "./TransformedImage"
import { updateCredits } from "@/lib/actions/user.actions"
import { getCldImageUrl } from "next-cloudinary"
import {addImage, updateImage } from "@/lib/actions/image.actions"
import { useRouter } from "next/navigation"
import { InsufficientCreditsModal } from "./InsuficientCreditsModal"

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
    const router = useRouter() ;
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
    async function onSubmit(values: z.infer<typeof formSchema>) {
        setisSubmeting(true);

        if (data || action) {
            const transformationUrl = getCldImageUrl({
                width: image?.width,
                height: image?.height,
                src: image?.publicId,
                ...transformationConfig,
            })

            const imageData = {
                title: values.title,
                publicId: image?.publicId,
                transformationType: type,
                width: image?.width,
                height: image?.height,
                config: transformationConfig,
                secureURL: image?.secureURL,
                transformationURL: transformationUrl,
                aspectRatio: values.aspectRatio,
                prompt: values.prompt,
                color: values.color,
            }

            if (action === 'Add') {
                try {
                    const NewImage = await addImage({
                        image: imageData,
                        userId,
                        path: '/',
                    })
                    if (NewImage) {
                        form.reset() ;
                        setIamge(data) ;
                        router.push(`/transformations/${NewImage._id}`) ;
                    }
                } catch (error) {
                    handleError(error);
                }
            }
            if (action === 'Update') {
                try {
                    const UpdateImage = await updateImage({
                        image: {
                            ...imageData ,
                            _id: data._id 
                        },
                        userId,
                        path: `/transformations/${data._id}`,
                    })
                    if (UpdateImage) {
                        router.push(`/transformations/${UpdateImage._id}`) ;
                    }
                } catch (error) {
                    handleError(error);
                }
            }
        }
        setisSubmeting(false) ;
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
            }, 1000)();
            return onChangeField(value) ;
        }
        const onTransformHandler = async () => {
            setisTransforming(true);
            settransformationConfig(deepMergeObjects(newTransformation, transformationConfig));
            setNewTransformation(null);
            startTransition(async () => {
                await updateCredits(userId, creditFee);
            })
        }

        useEffect(() => {
            if ((type === 'restore' || type === 'removeBackground') && image) {
                setNewTransformation(transformation.config)
            }
        }, [image , transformation.config , type])
        return (
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {creditBalance < Math.abs(creditFee) && <InsufficientCreditsModal />}
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
                                <Select onValueChange={(value) => onSelectFieldHandler(value, field.onChange)} value={field.value}>
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
                            render={({ field }) => (
                                <MediaUploader
                                    onValueChange={field.onChange}
                                    setImage={setIamge}
                                    publicId={field.value}
                                    image={image}
                                    type={type} />
                            )} />
                        <TransformedImage
                            image={image}
                            type={type}
                            title={form.getValues().title}
                            isTransforming={isTransforming}
                            setIsTransforming={setisTransforming}
                            transformationConfig={transformationConfig}
                        />
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

    export default TransformationForm ;