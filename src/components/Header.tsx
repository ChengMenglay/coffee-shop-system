import React from "react";
type HeaderPros = {
  title: string;
  total?: number;
  subtitle: string;
};
export default function Header({ title, total, subtitle }: HeaderPros) {
  return (
    <div className=" space-y-1">
      <h1 className="text-2xl font-extrabold">
        {title} {total ? "(`(${total})`" : ""}
      </h1>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}
