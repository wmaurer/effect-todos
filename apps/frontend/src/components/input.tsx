import { KeyboardEvent, useCallback } from "react";

// copied from https://github.com/tastejs/todomvc/blob/gh-pages/examples/react/src/todo/components/input.jsx

const sanitize = (string: string) => {
    const map: Record<string, string> = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
        "/": "&#x2F;",
    };
    const reg = /[&<>"'/]/gi;
    return string.replace(reg, (match) => map[match] || match);
};

const hasValidMin = (value: string, min: number) => value.length >= min;

type InputProps = {
    onSubmit: (value: string) => void;
    placeholder?: string;
    label?: string;
    defaultValue?: string;
    onBlur?: () => void;
};

export const Input = ({ onSubmit, placeholder, label, defaultValue, onBlur }: InputProps) => {
    const handleBlur = useCallback(() => {
        if (onBlur) onBlur();
    }, [onBlur]);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
                if (e.target instanceof HTMLInputElement === false) return;
                const value = e.target.value.trim();

                if (!hasValidMin(value, 2)) return;

                onSubmit(sanitize(value));
                e.target.value = "";
            }
        },
        [onSubmit],
    );

    return (
        <div className="input-container">
            <input
                className="new-todo"
                id="todo-input"
                type="text"
                data-testid="text-input"
                autoFocus
                placeholder={placeholder}
                defaultValue={defaultValue}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
            />
            <label className="visually-hidden" htmlFor="todo-input">
                {label}
            </label>
        </div>
    );
};
