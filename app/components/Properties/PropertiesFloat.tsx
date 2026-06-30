import { JSONFloatType } from "@jsonhero/json-infer-types";
import { formatValue } from "~/utilities/formatter";
import { DataTable } from "../DataTable";
import { ValueIcon } from "../ValueIcon";
import { useTranslation } from "react-i18next";

export type PropertiesFloatProps = {
  type: JSONFloatType;
};

export function PropertiesFloat(info: PropertiesFloatProps) {
  const { t } = useTranslation();
  return (
    <DataTable
      rows={[
        {
          key: t("properties.formattedValue"),
          value: formatValue(info.type) ?? "",
          icon: <ValueIcon type={info.type} />,
        },
        {
          key: t("properties.type"),
          value: info.type.name,
        },
      ]}
    />
  );
}