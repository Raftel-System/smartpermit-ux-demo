import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
    label: string;
    options: string[];                     // catalogue complet
    setOptions?: (next: string[]) => void; // pour enrichir le catalogue lors d'une création
    selected: string[];                    // valeurs sélectionnées
    setSelected: (next: string[]) => void; // setter sélection
    placeholder?: string;
    className?: string;
};

export function DropdownTagMulti({
                                     label,
                                     options,
                                     setOptions,
                                     selected,
                                     setSelected,
                                     placeholder = "Rechercher, ou saisir pour créer…",
                                     className
                                 }: Props) {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");

    const norm = (s: string) => s.trim().toLowerCase();
    const isSelected = (v: string) => selected.some(s => norm(s) === norm(v));
    const inOptions = (v: string) => options.some(o => norm(o) === norm(v));

    // Options restantes = options - selected
    const remaining = React.useMemo(
        () => options.filter(o => !isSelected(o)),
        [options, selected]
    );

    const filtered = React.useMemo(() => {
        const q = norm(query);
        if (!q) return remaining;
        return remaining.filter(o => norm(o).includes(q));
    }, [query, remaining]);

    const canCreate = query.trim().length > 0 && !inOptions(query);

    const addValue = (value: string) => {
        const v = value.trim();
        if (!v) return;
        let nextSel = selected;
        if (!isSelected(v)) nextSel = [...selected, v];
        setSelected(nextSel);
        if (setOptions && !inOptions(v)) setOptions([...options, v]);
        setQuery("");
    };

    const pickValue = (value: string) => addValue(value);

    const removeValue = (value: string) => {
        setSelected(selected.filter(s => norm(s) !== norm(value)));
        // On NE supprime PAS du catalogue 'options' -> il réapparaît automatiquement dans le menu
    };

    return (
        <div className={cn("w-full", className)}>
            <Label className="mb-1 block">{label}</Label>

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button type="button" variant="outline" className="w-full justify-between">
            <span className={cn(selected.length === 0 && "text-muted-foreground")}>
              {selected.length ? `${selected.length} sélectionné(s)` : "Sélectionner…"}
            </span>
                        <ChevronDown className="h-4 w-4 opacity-70" />
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command shouldFilter={false}>
                        <CommandInput
                            value={query}
                            onValueChange={setQuery}
                            placeholder={placeholder}
                        />
                        <CommandList className="max-h-56">
                            <CommandEmpty>
                                {canCreate ? (
                                    <div className="p-2">
                                        <Button variant="ghost" className="w-full justify-start" onClick={() => addValue(query)}>
                                            Créer “{query.trim()}”
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="px-2 py-1 text-sm text-muted-foreground">Aucun résultat</div>
                                )}
                            </CommandEmpty>

                            {filtered.length > 0 && (
                                <CommandGroup heading="Options">
                                    {filtered.map((opt) => (
                                        <CommandItem
                                            key={opt}
                                            value={opt}
                                            onSelect={() => pickValue(opt)}
                                        >
                                            {opt}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )}

                            {canCreate && inOptions(query) === false && (
                                <CommandGroup heading="Créer">
                                    <CommandItem onSelect={() => addValue(query)}>
                                        Créer “{query.trim()}”
                                    </CommandItem>
                                </CommandGroup>
                            )}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {/* Tags sélectionnés */}
            <div className="mt-2 flex flex-wrap gap-2">
                {selected.map((it) => (
                    <Badge
                        key={it}
                        variant="outline"
                        className="bg-accent/10 cursor-pointer"
                        onClick={() => removeValue(it)}
                        title="Cliquer pour retirer"
                    >
                        {it}
                    </Badge>
                ))}
                {selected.length === 0 && (
                    <span className="text-sm text-muted-foreground">Aucune sélection</span>
                )}
            </div>

            {/* Ajout direct via input + bouton (confort) */}
            <div className="mt-2 flex gap-2">
                <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Saisir et Entrée pour ajouter"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            addValue(query);
                        }
                    }}
                />
                <Button type="button" variant="outline" onClick={() => addValue(query)}>
                    Ajouter
                </Button>
            </div>
        </div>
    );
}