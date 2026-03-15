"""
Data conversion: CSV ↔ JSON ↔ XML ↔ YAML ↔ XLSX
"""
import json
import csv
import io
from pathlib import Path


def convert_data(src_path: str, out_path: str, src_fmt: str, tgt_fmt: str):
    src = src_fmt.lower()
    tgt = tgt_fmt.lower()
    content = Path(src_path).read_text(encoding="utf-8", errors="replace")

    # --- Parse source ---
    data = None

    if src == "csv":
        reader = csv.DictReader(io.StringIO(content))
        data = list(reader)

    elif src == "json":
        data = json.loads(content)

    elif src in ("yaml", "yml"):
        import yaml
        data = yaml.safe_load(content)

    elif src == "xml":
        import xmltodict
        data = xmltodict.parse(content)

    elif src in ("xlsx", "xls"):
        import pandas as pd
        df = pd.read_excel(src_path)
        data = df.to_dict(orient="records")

    else:
        raise ValueError(f"Unsupported source data format: {src}")

    # --- Write target ---
    out = Path(out_path)

    if tgt == "json":
        out.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")

    elif tgt == "csv":
        import pandas as pd
        df = pd.DataFrame(data) if isinstance(data, list) else pd.DataFrame([data])
        df.to_csv(str(out), index=False)

    elif tgt in ("yaml", "yml"):
        import yaml
        out.write_text(yaml.dump(data, allow_unicode=True, default_flow_style=False), encoding="utf-8")

    elif tgt == "xml":
        import dicttoxml
        xml_bytes = dicttoxml.dicttoxml(data, custom_root="root", attr_type=False)
        out.write_bytes(xml_bytes)

    elif tgt in ("xlsx", "xls"):
        import pandas as pd
        df = pd.DataFrame(data) if isinstance(data, list) else pd.DataFrame([data])
        df.to_excel(str(out), index=False)

    else:
        raise ValueError(f"Unsupported target data format: {tgt}")
