import React, { useEffect, useState } from "react";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { TextField } from "../../../lib/components/forms/text-field/TextField";
import { CheckboxField } from "../../../lib/components/forms/checkbox/CheckboxField";
import { SelectField } from "../../../lib/components/forms/select-field/SelectField";
import { FaDiscord, FaGlobe } from "react-icons/fa";
import { CustomSelect, Option } from "../../../lib/components/forms/custom-select/CustomSelect";
import { Button } from "../../../lib/elements/buttons/button/Button";
import { LinkedComponentState, LinkedSelectWrapper } from "../../../lib/components/forms/linked-select-field/LinkedSelectWrapper";
import { LinkedSelectItem } from "../../../lib/components/forms/linked-select-field/LinkedSelect";
import { DragAndDropFiles } from "../../../lib/components/forms/drag-and-drop-files/DragAndDropFiles";

type PlaygroundItem = {
  id: string;
  label: string;
};

export const VALIDATIONS_MESSAGES = {
  REQUIRED: "This field is required",
  TOO_SHORT_STRING: "Must be at least ${min} characters",
  TOO_LONG_STRING: "Must be at most ${max} characters",
  NOT_ALPHANUMERIC: "Must use alphanumeric characters",
  DECIMAL: "Must be a decimal number or integer",
  INTEGER: "Must be an integer",
  USERNAME_CHARS: "Must use only letters, numbers, hypens or underscores",
  NOT_NUMBER: "Must be a number",
  MUST_BE_GREATER: "Must be greater than or equal to  ${min}",
  MUST_BE_LOWER: "Must be lower than or equal to ${max}",
};

export type SampleFormProps = {
  onSuccess?: () => void;
};

type FormType = {
  email: string;
  password: string;
  nativecountry: string;
  remember: boolean;
  multiplecountry: string[];
  singlecountry: string;
  files: File[];
};

const SampleForm: React.FC<SampleFormProps> = (props) => {
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [options, setOptions] = useState<Option[]>([]);

  useEffect(() => {
    setTimeout(() => {
      setOptions([
        {
          value: "us",
          label: "United states",
        },
        {
          value: "canada",
          label: "Canada",
        },
        {
          value: "ro",
          label: "Romania",
        },
      ]);
    }, 300);
  }, []);

  const fileValidator = Yup.mixed<FileList>() // Pass in the type of `fileUpload`
    .test(
      "fileSize",
      "Only documents up to 2MB are permitted.",
      (files) =>
        !files || // Check if `files` is defined
        files.length === 0 || // Check if `files` is not an empty list
        Array.from(files).every((file) => file.size <= 2_000_000)
    );

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .required("Email is required")
      .min(1, VALIDATIONS_MESSAGES.MUST_BE_GREATER)
      .max(20, VALIDATIONS_MESSAGES.MUST_BE_LOWER)
      .matches(
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Format email invalid."
      ),
    password: Yup.string().min(8, VALIDATIONS_MESSAGES.MUST_BE_GREATER),
    nativecountry: Yup.string().notOneOf(["canada"], "nu e voie e zapada"),
    remember: Yup.boolean().oneOf([true], "Nu vreau sa te uit"),
    multiplecountry: Yup.lazy((val) => (Array.isArray(val) ? Yup.array().of(Yup.string()) : Yup.string())),
    singlecountry: Yup.string().notOneOf(["canada"], "nu e voie e zapada"),
    files: fileValidator,
    // county: Yup.string().required('County is required'),
    // city: Yup.string().required('City is required'),
    // street: Yup.string().required('Street is required'),
  });

  const hookForm = useForm<FormType>({
    defaultValues: {
      email: "daia@yahoo.com1",
      password: "1234",
      nativecountry: "canada",
      remember: false,
      multiplecountry: ["us"],
      singlecountry: "us",
    },
    resolver: yupResolver(validationSchema),
  });

  const {
    register,
    formState: { errors },
    handleSubmit,
    control,
    setValue,
    reset,
  } = hookForm;

  const onSubmit = (data: any) => {
    // setLoading(true)
    // setTimeout(
    //   () => {
    //     console.log(data)
    //     setLoading(false)
    //     if (props?.onSuccess) {C
    //       props.onSuccess()
    //     }
    //   }, 1000
    // )

    const formData = new FormData();

    formData.append("email", data.email);
    formData.append("files[0]", data.files[0]);

    fetch("http://localhost:8080/file/success_file_info", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => console.log(data))
      .catch((err) => console.error(err));
  };

  const fillForm = () => {
    setValue("email", "test@test.ro");
    setValue("password", "nikepassword");
    setValue("nativecountry", "ro");
    setValue("remember", true);
    setValue("multiplecountry", ["canada"]);
    setValue("singlecountry", "us");
  };

  const initialState: LinkedComponentState = {
    "county": undefined,
    "city": undefined,
    "street": undefined,
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <>
        <TextField
          addon="@"
          register={register("email")}
          placeholder="example@mail.com"
          required={true}
          errors={errors}
          name="email"
          disabled={disabled}
          label={"Email"}
        />

        <TextField
          type="password"
          placeholder="*******"
          name="password"
          required={true}
          icon={FaDiscord}
          register={register("password")}
          errors={errors}
          disabled={disabled}
          label={"Password"}
        />

        <CheckboxField disabled={disabled} name="remember" label="Remember me" errors={errors} register={register("remember")} />

        <SelectField
          disabled={disabled}
          icon={FaDiscord}
          required={true}
          register={register("nativecountry")}
          name="nativecountry"
          label="Native Country"
          errors={errors}>
          {options.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </SelectField>

        <CustomSelect
          options={options}
          icon={FaGlobe}
          required={true}
          disabled={disabled}
          isMulti={true}
          label="Multiple Country"
          name="multiplecountry"
          errors={errors}
          control={control}
        />

        <CustomSelect
          options={options}
          icon={FaGlobe}
          required={true}
          disabled={disabled}
          label="Single Country"
          name="singlecountry"
          errors={errors}
          control={control}
        />

        <br />
        <hr />
        <LinkedSelectWrapper
          form={hookForm}
          fetcher={(url: string) => fetch(url)}
          initialState={initialState}
          firstSelectUrl={"http://localhost:4001/counties"}
          responseTransformers={{ value: "id", label: "name" }}>
          <LinkedSelectItem<PlaygroundItem>
            name="county"
            label="County"
            filterUrl={"http://localhost:4001/cities?foreignKey="}
            filterResponseTransformers={{ value: "id", label: "label" }}>
            <LinkedSelectItem<PlaygroundItem>
              name="city"
              label="City"
              filterUrl={"http://localhost:4001/streets?foreignKey="}
              filterResponseTransformers={{ value: "id", label: "label" }}>
              <LinkedSelectItem name="street" label="Street" />
            </LinkedSelectItem>
          </LinkedSelectItem>
        </LinkedSelectWrapper>

        <DragAndDropFiles name="files" control={control} errors={errors} label="Fisiere" multiple={true} />

        <div className="flex flex-row gap-2">
          <Button variant={"outline"} onClick={fillForm}>
            Fill
          </Button>
          <Button variant={"outline"} onClick={() => setDisabled((prev) => !prev)}>
            Disable
          </Button>
          <Button type="reset" variant={"outline"}>
            Reset
          </Button>
        </div>

        <Button loading={loading} type="submit">
          Login
        </Button>
      </>
    </form>
  );
};

export default SampleForm;
