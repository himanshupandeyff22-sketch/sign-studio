# 3D-LEX v1.0: 3D Lexicons for ASL and Sign Language of the Netherlands

[![Project Page](https://img.shields.io/badge/Project%20Page-olineranum.github.io%2FSAPA-brightgreen)](https://olineranum.github.io/SAPA/)
[![LREC-COLING 2024](https://img.shields.io/badge/LREC--COLING%202024-Sign%20Language%20Workshop-blue)](https://aclanthology.org/2024.signlang-1.33/)
[![License](https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey)](https://creativecommons.org/licenses/by/4.0/)

**Authors**: Oline Ranum · Gomèr Otterspeer · Jari I. Andersen · Robert G. Belleman · Floris Roelofsen
**Affiliation**: ILLC & Computational Science Lab, University of Amsterdam
**Contact**: o.ranum@surrey.ac.uk

[Paper](https://aclanthology.org/2024.signlang-1.33/) | [Project Page](https://olineranum.github.io/SAPA/)

---

## Abstract

We present an efficient approach for capturing sign language in 3D, introduce the **3D-LEX v1.0 dataset**, and detail a method for semi-automatic annotation of phonetic properties. Our procedure integrates three motion capture techniques — high-resolution 3D poses, 3D handshapes, and depth-aware facial features — and attains an average sampling rate of **one sign every 10 seconds**. The 3D-LEX dataset includes 1,000 signs from American Sign Language and 1,000 signs from Sign Language of the Netherlands. Semi-automatic handshape labels enhance gloss recognition accuracy by **5% over no annotations** and **1% over expert annotations**.

---

## Dataset

3D-LEX v1.0 is captured using three complementary motion capture systems:

| System | Captures | Equipment |
|---|---|---|
| Vicon optical MoCap | Full-body 3D pose | 12 Vero v2.2 cameras, 53-marker FrontWaist template |
| StretchSense gloves | 3D handshapes | Pro Fidelity gloves, 26 stretch sensors per hand |
| Live Link Face | Facial blendshapes | iPhone 13 Pro, ARKit |

| Statistic | Value |
|---|---|
| ASL signs | 1,000 |
| NGT signs | 1,000 |
| Capture rate | ~10 sec/sign (including setup, performance, record, archive) |
| Landmark detection rate | 97.6% (real), 97.8% (synthetic) |
| Alignment with WLASL | 695/1,000 glosses |
| Alignment with SEMLEX | 921/1,000 glosses |

> **Data availability**: 3D-LEX will be made publicly available. Contact the authors for access.

---

## Key Results — Semi-Automatic Phonetic Annotation

Handshape labels generated automatically via temporal segmentation + k-means clustering, evaluated on the WLASL isolated sign recognition benchmark (SL-GCN):

| Condition | Top-1 Accuracy |
|---|---|
| No handshape labels | 0.44 ± 0.01 |
| Expert handshape labels | 0.48 ± 0.01 |
| **Automatic labels (ours)** | **0.49 ± 0.01** |

Automatic labels match or exceed expert annotations, demonstrating that 3D motion capture data can meaningfully complement manual linguistic annotation.

---

## Setup

```bash
bash setup/setup.sh
conda activate saa
```

### WLASL Evaluation Data

```bash
mkdir data/wlasl/
wget https://zenodo.org/record/6674324/files/WLASL.zip?download=1 -O data/wlasl/WLASL.zip
cd data/wlasl && unzip WLASL.zip && rm WLASL.zip
```

Get the merged ASL-LEX + WLASL metadata from [Kezar et al. 2023](https://github.com/leekezar/Modeling-ASL-Phonology/tree/main/training_data).

---

## Usage

### Generate Handshape Annotations

```bash
python main_ED.py --mode annotate      # Euclidean distance method
python main_KMeans.py --mode annotate  # K-means clustering method
```

### Evaluate on WLASL

```bash
cd evaluation/isolated_sign_recognition/
python train.py
# Update model path in configs/gcn_test.yaml
python test.py
```

---

## Repository Structure

```
SAPA/
├── src/                # Core annotation pipeline
├── methods/            # Clustering method variants
├── evaluation/
│   └── isolated_sign_recognition/  # WLASL benchmark (SL-GCN)
├── data/               # Data lists and metadata
├── figures/            # Visualisation figures
├── setup/              # Environment setup
├── main_ED.py          # Euclidean distance annotation entry point
├── main_KMeans.py      # K-means annotation entry point
└── docs/               # GitHub Pages project page
```

---

## Citation

```bibtex
@inproceedings{ranum2024_3dlex,
  title     = {3D-LEX v1.0: 3D Lexicons for {A}merican {S}ign {L}anguage and
               {S}ign {L}anguage of the {N}etherlands},
  author    = {Ranum, Oline and Otterspeer, Gom{\`e}r and Andersen, Jari I. and
               Belleman, Robert G. and Roelofsen, Floris},
  booktitle = {Proceedings of the LREC-COLING 2024 11th Workshop on the
               Representation and Processing of Sign Languages},
  pages     = {252--263},
  publisher = {ELRA and ICCL},
  year      = {2024},
  url       = {https://aclanthology.org/2024.signlang-1.33/}
}
```

## License

The 3D-LEX dataset is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Code is released under MIT.