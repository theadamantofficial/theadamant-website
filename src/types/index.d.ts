import * as React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    required?: boolean;
}

export interface DropdownProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    required?: boolean;
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    required?: boolean;
}
